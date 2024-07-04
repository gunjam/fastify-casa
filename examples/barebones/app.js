'use strict'

const path = require('node:path')
const autoload = require('@fastify/autoload')
const fastifyCasa = require('../../index')

/** @type {import('fastify').FastifyPluginAsync} */
module.exports = async function casaBarebonesApp (app, opts) {
  // Register the CASA plugin with some config
  app.register(fastifyCasa, {
    views: [
      path.resolve(__dirname, 'views'),
    ],
    session: {
      name: 'myappsessionid',
      secret: 'secret',
      ttl: 3_600,
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

  // This should work and not show the CASA 404 page because the CASA
  // middleware should be encapsulated within the fastify-casa plugin
  app.get('/test-page', (request, reply) => {
    return 'hello'
  })

  // Auto load CASA definitions plugins
  app.register(autoload, {
    dir: path.join(__dirname, 'definitions'),
    dirNameRoutePrefix: false,
  })

  // Auto load CASA plugins
  app.register(autoload, {
    dir: path.join(__dirname, 'plugins'),
    options: { waypoints: ['review'] },
    dirNameRoutePrefix: false,
  })
}
