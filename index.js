'use strict'

const { join } = require('node:path')
const { configure: casaConfigure, MutableRouter, Plan, field, validators, ValidationError, JourneyContext, constants, waypointUrl } = require('@dwp/govuk-casa')
const fastifyExpress = require('@fastify/express')
const express = require('express')
const fp = require('fastify-plugin')

/** @type {import('fastify').FastifyPluginAsync} */
async function casaWrapper (fastify, opts) {
  const prefix = fastify.prefix || '/'
  const plan = opts.plan || new Plan({ arbiter: 'auto' })
  const pages = opts.pages || []
  const hooks = opts.hooks || []
  const events = opts.events || []
  const casaPlugins = opts.plugins || []
  const nunjucksFilters = []
  const nunjucksGlobals = []
  const nunjucksViews = []
  const staticRouter = { routes: [] }
  const ancillaryRouter = { routes: [] }
  const journeyRouter = { routes: [] }
  const kNunjucksEnv = Symbol('casa:nunjucks')

  for (const method of Object.getOwnPropertyNames(MutableRouter.prototype)) {
    if (method !== 'constructor' && method !== 'seal') {
      staticRouter[method] = function (...args) {
        this.routes.push([method, santiseRouterArgs(args, this.prefix)])
      }
      ancillaryRouter[method] = function (...args) {
        this.routes.push([method, santiseRouterArgs(args, this.prefix)])
      }
      journeyRouter[method] = function (...args) {
        this.routes.push([method, santiseRouterArgs(args, this.prefix)])
      }
    }
  }

  function addPage (opts) {
    pages.push({
      ...opts,
      waypoint: join(`.${this.prefix.replace(prefix, '')}`, opts.waypoint ?? '.').replace(/\/$/, ''),
    })
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
      bootstrap: ({ nunjucksEnv }) => {
        nunjucksEnv.modifyBlock(blockname, cb)
      },
    })
  }

  function addNunjucksFilter (...filterArgs) {
    nunjucksFilters.push(filterArgs)
  }

  function addNunjucksGlobal (...globalArgs) {
    nunjucksGlobals.push(globalArgs)
  }

  function addNunjucksViews (...globalArgs) {
    nunjucksViews.push(globalArgs)
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

  function santiseRouterArgs (args, rPrefix) {
    if (typeof args[0] === 'string') {
      args[0] = join(`${rPrefix.replace(prefix, '')}`, args[0] ?? '.').replace(/\/$/, '')
    }
    return args
  }

  function fixStaticPath (req, res, next) {
    res.locals.assetPath = join(prefix, 'govuk/assets')
    res.locals.casa.staticMountUrl = join(prefix, '/')
    next()
  }

  const nunjucks = {
    addFilter: addNunjucksFilter,
    addGlobal: addNunjucksGlobal,
    addViews: addNunjucksViews,
    modifyBlock,
  }

  fastify.decorate('casa', {
    prefix,
    plan,
    addPage,
    addEvent,
    staticRouter,
    ancillaryRouter,
    journeyRouter,
    configure,
    nunjucks,
    register: registerCasaPlugin,
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

  fastify.addHook('onRegister', (instance) => {
    instance.casa.prefix = instance.prefix
    instance.casa.staticRouter.prefix = instance.prefix
    instance.casa.ancillaryRouter.prefix = instance.prefix
    instance.casa.journeyRouter.prefix = instance.prefix
  })

  fastify.addHook('onReady', async () => {
    const casa = casaConfigure({
      ...opts,
      views: [
        ...opts.views,
        ...nunjucksViews,
      ],
      pages,
      plan,
      events,
      hooks,
      plugins: casaPlugins,
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
