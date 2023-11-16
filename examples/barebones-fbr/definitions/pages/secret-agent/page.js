const { field, validators: r } = require('../../../../../index')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function secretAgentPage (app, opts) {
  app.casa.addPage({
    waypoint: '/',
    view: 'pages/secret-agent/template.njk',
    fields: [
      field('license', { optional: true }).validators([
        r.strlen.make({
          max: 20,
          errorMsgMax: 'The license id is too long'
        })
      ])
    ]
  })
}
