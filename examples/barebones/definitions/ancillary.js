'use strict'

const { JourneyContext } = require('../../../index')

/** @type {import('fastify').FastifyPluginAsync} */
module.exports = async function ancillaryRoutes (app, opts) {
  // Example: Adding custom routes before page handlers
  // You can do this by adding a route/middleware to the `ancillaryRouter`.
  app.casa.ancillaryRouter.use('/start', (req, res) => {
    // To demonstrate Ephemeral Contexts, we'll create one here and make it
    // available to the user via a button on the welcome page
    if (!req.session.demoContextId) {
      const demoContext = JourneyContext.fromContext(req.casa.journeyContext, req)
      JourneyContext.putContext(req.session, demoContext)
      req.session.demoContextId = demoContext.identity.id
    }

    res.render('welcome.njk', {
      demoContextId: req.session.demoContextId,
      salutation: ['John', 'Bob', 'Sue', 'Clara'][Math.floor(Math.random() * 4)],
    })
  })

  app.casa.ancillaryRouter.use('/what-happens-next', (req, res) => {
    res.render('what-happens-next.njk')
  })

  // Example of how to mount a handler for the `/` index route. Need to use a
  // regex for the specific match to only `/`.
  app.casa.ancillaryRouter.use(/^\/$/, (req, res) => {
    res.redirect(302, `${req.baseUrl}/start`)
  })
}
