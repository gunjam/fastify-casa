const { field, validators: r } = require('../../../../index')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function personalDetailsPage (app, opts) {
  const fields = [
    field('title').validators([
      r.required.make({
        errorMsg: 'personal-details:field.title.empty',
      }),
      r.strlen.make({
        max: 10,
        errorMsg: 'personal-details:field.title.tooLong',
      }),
    ]).processors([
      (value) => {
        // Example: uppercase the field value
        return String(value).toUpperCase()
      },
    ]),

    field('firstName').validators([
      r.required.make({
        errorMsg: 'personal-details:field.firstName.empty',
      }),
    ]),

    field('middleName', { optional: true }).validators([
      r.regex.make({
        pattern: /^[a-z ]+$/i,
      }),
    ]),

    field('lastName').validators([
      r.required.make({
        errorMsg: 'personal-details:field.lastName.empty',
      }),
    ]),

    field('dob').validators([
      r.required.make({
        errorMsg: {
          summary: 'Enter date of birth',
          focusSuffix: ['[dd]', '[mm]', '[yyyy]'],
        },
      }),
      r.dateObject.make({
        beforeOffsetFromNow: { days: 1 },
        errorMsgBeforeOffset: {
          summary: 'Date of birth cannot be in the future',
        },
      }),
    ]),

    field('nino').validators([
      r.required.make({
        errorMsg: 'personal-details:field.nino.empty',
      }),
      r.nino.make(),
    ]),
  ]

  app.casa.addPage({
    waypoint: 'personal-details',
    view: 'pages/personal-details.njk',
    fields,
    hooks: [{
      hook: 'prerender',
      middleware: (req, res, next) => {
        req.log.info('Demo of a page-level hook function')
        next()
      },
    }],
  })
}
