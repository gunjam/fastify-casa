'use strict'

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function ancillaryRoutes (app, opts) {
  app.casa.ancillaryRouter.use('/', (req, res) => {
    res.render('what-happens-next/template.njk')
  })
}
