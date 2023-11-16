'use strict'

const { JourneyContext } = require('../../../../index')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function ancillaryRoutes (app, opts) {
  // Example: Adding custom routes before page handlers
  // You can do this by adding a route/middleware to the `ancillaryRouter`.
  app.casa.ancillaryRouter.use('/', (req, res) => {
    // To demonstrate Ephemeral Contexts, we'll create one here and make it
    // available to the user via a button on the welcome page
    if (!req.session.demoContextId) {
      const demoContext = JourneyContext.fromContext(req.casa.journeyContext, req)
      JourneyContext.putContext(req.session, demoContext)
      req.session.demoContextId = demoContext.identity.id
    }

    res.render('start/template.njk', {
      demoContextId: req.session.demoContextId,
      salutation: ['John', 'Bob', 'Sue', 'Clara'][Math.floor(Math.random() * 4)]
    })
  })
}
