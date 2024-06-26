'use strict'

const path = require('node:path')
const autoload = require('@fastify/autoload')
const fastifyCasa = require('../../index')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function casaBarebonesApp (app, opts) {
  // Register the CASA plugin with some config
  app.register(fastifyCasa, {
    views: [
      path.resolve(__dirname, 'routes'),
      path.resolve(__dirname, 'views'),
    ],
    session: {
      name: 'myappsessionid',
      secret: 'secret',
      ttl: 3600,
      secure: false,
    },
    i18n: {
      dirs: [path.resolve(__dirname, 'locales')],
      locales: ['en', 'cy'],
    },
    hooks: [{
      hook: 'journey.postvalidate',
      middleware: (req, res, next) => {
        const errors = req.casa.journeyContext.getValidationErrorsForPage(req.casa.waypoint)
        req.log.info(`Running the example "journey.postvalidate" hook on "${req.path}". There were ${errors.length} errors`)
        next()
      },
    }],
  })

  // Auto load routes
  app.register(autoload, {
    dir: path.join(__dirname, 'routes'),
  })

  // Auto load CASA plugins
  app.register(autoload, {
    dir: path.join(__dirname, 'plugins'),
    options: { waypoints: ['review'] },
    dirNameRoutePrefix: false,
  })
}
