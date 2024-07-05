'use strict'

/** @type {import('fastify').FastifyPluginAsync} */
module.exports = async function submit (fastify, opts) {
  fastify.casa.addPage({
    waypoint: 'submit',
    view: 'pages/submit.njk',
    fields: [],
    hooks: [{
      hook: 'presanitise',
      middleware: (req, res, next) => {
        // Here you would manipulate the data before then posting to some
        // upstream service
        req.log.info(req.casa.journeyContext.getData(), 'submitted data')

        // Remember to clear the journey data once submitted
        req.session.destroy((err) => {
          if (err) {
            console.error(err)
          }
          res.status(302).redirect(`${req.baseUrl}/what-happens-next`)
        })
      },
    }],
  })
}
