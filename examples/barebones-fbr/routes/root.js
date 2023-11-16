'use strict'

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function root (app, opts) {
  // Example of how to mount a handler for the `/` index route. Need to use a
  // regex for the specific match to only `/`.
  app.casa.ancillaryRouter.use(/^\/$/, (req, res) => {
    res.redirect(302, `${req.baseUrl}/start`)
  })
}
