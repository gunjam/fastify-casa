const { field, validators: r } = require('../../../../index')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function secretAgentPage (app, opts) {
  const fields = [
    field('license', { optional: true }).validators([
      r.strlen.make({
        max: 20,
        errorMsgMax: 'The license id is too long'
      })
    ])
  ]

  app.casa.addPage({
    waypoint: 'secret-agent',
    view: 'pages/secret-agent.njk',
    fields
  })
}
