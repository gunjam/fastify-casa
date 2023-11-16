'use strict'

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function plan (app, opts) {
  app.casa.plan.addSequence(
    'personal-details',
    'checkboxes',
    'contact-details'
  )

  app.casa.plan.setRoute('contact-details', 'secret-agent', (r, c) => c.data['contact-details'].tel === '007')
  app.casa.plan.setRoute('contact-details', 'work/impact', (r, c) => c.data['contact-details'].tel !== '007')
  app.casa.plan.setRoute('secret-agent', 'work/impact')

  app.casa.plan.addSequence(
    'work/impact',
    'review',
    'submit'
  )
}
