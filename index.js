'use strict'

const { join } = require('node:path')
const { configure: casaConfigure, MutableRouter, Plan, field, validators, ValidationError, JourneyContext, constants, waypointUrl } = require('@dwp/govuk-casa')
const fastifyExpress = require('@fastify/express')
const express = require('express')
const fp = require('fastify-plugin')

/** @param {import('fastify').FastifyInstance} app */
async function casaWrapper (fastify, opts) {
  const prefix = fastify.prefix || '/'
  const plan = opts.plan || new Plan({ arbiter: 'auto' })
  const pages = opts.pages || []
  const hooks = opts.hooks || []
  const events = opts.events || []
  const casaPlugins = opts.plugins || []
  const nunjucksFilters = []
  const nunjucksGlobals = []
  const staticRouter = { routes: [] }
  const ancillaryRouter = { routes: [] }
  const journeyRouter = { routes: [] }
  const kNunjucksEnv = Symbol('casa:nunjucks')

  for (const method of Object.getOwnPropertyNames(MutableRouter.prototype)) {
    if (method !== 'constructor' && method !== 'seal') {
      staticRouter[method] = function (...args) {
        this.routes.push([method, args])
      }
      ancillaryRouter[method] = function (...args) {
        this.routes.push([method, args])
      }
      journeyRouter[method] = function (...args) {
        this.routes.push([method, args])
      }
    }
  }

  function addPage (opts) {
    pages.push(opts)
  }

  function addEvent (opts) {
    events.push(opts)
  }

  function registerCasaPlugin (opts) {
    casaPlugins.push(opts)
  }

  function configure (cb) {
    casaPlugins.push({ configure: cb })
  }

  function modifyBlock (blockname, cb) {
    casaPlugins.push({
      configure: () => {},
      bootstrap: function ({ nunjucksEnv }) {
        nunjucksEnv.modifyBlock(blockname, cb)
      }
    })
  }

  function addNunjucksFilter (...filterArgs) {
    nunjucksFilters.push(filterArgs)
  }

  function addNunjucksGlobal (...globalArgs) {
    nunjucksGlobals.push(globalArgs)
  }

  function defaultRouteHandler (request, reply) {
    this[kNunjucksEnv].render('casa/errors/static.njk', (err, res) => {
      if (!err) {
        reply.status(500).header('content-type', 'text/html').send(res)
      } else {
        reply.status(500).send(err)
      }
    })
  }

  function fixStaticPath (req, res, next) {
    res.locals.assetPath = join(prefix, 'govuk/assets')
    res.locals.casa.staticMountUrl = join(prefix, '/')
    next()
  }

  const nunjucks = {
    addFilter: addNunjucksFilter,
    addGlobal: addNunjucksGlobal,
    modifyBlock
  }

  fastify.decorate('casa', {
    plan,
    addPage,
    addEvent,
    staticRouter,
    ancillaryRouter,
    configure,
    nunjucks,
    register: registerCasaPlugin
  })

  function logError (err, req, res, next) {
    req.log.error(err)
    next(err)
  }

  const app = express()

  fastify.register(async (casa) => {
    await casa.register(fastifyExpress)
    casa.use(app)
    casa.get('/*', defaultRouteHandler)
    casa.post('/*', defaultRouteHandler)
  })

  fastify.addHook('onReady', async function () {
    const casa = casaConfigure({
      ...opts,
      pages,
      plan,
      events,
      hooks,
      plugins: casaPlugins
    })

    fastify.decorate(kNunjucksEnv, casa.nunjucksEnv)
    casa.ancillaryRouter.use(fixStaticPath)
    casa.journeyRouter.use(fixStaticPath)
    casa.postMiddleware.unshift(logError)

    for (const [method, args] of staticRouter.routes) {
      casa.staticRouter[method](...args)
    }
    for (const [method, args] of ancillaryRouter.routes) {
      casa.ancillaryRouter[method](...args)
    }
    for (const [method, args] of journeyRouter.routes) {
      casa.journeyRouter[method](...args)
    }
    for (const filterArgs of nunjucksFilters) {
      casa.nunjucksEnv.addFilter(...filterArgs)
    }
    for (const globalArgs of nunjucksGlobals) {
      casa.nunjucksEnv.addGlobal(...globalArgs)
    }

    casa.mount(app, { route: prefix })
  })
}

module.exports = fp(casaWrapper, { name: 'fastify-casa' })
module.exports.Plan = Plan
module.exports.field = field
module.exports.validators = validators
module.exports.ValidationError = ValidationError
module.exports.JourneyContext = JourneyContext
module.exports.constants = constants
module.exports.waypointUrl = waypointUrl
