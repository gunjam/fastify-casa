'use strict'

const { field, validators: r, ValidationError } = require('../../../../index')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function checkboxesPage (app, opts) {
  // Custom validation, with sanitisation, using a basic object format
  const boxValidator = {
    name: 'boxCount',
    validate: (value, { waypoint, fieldName, journeyContext }) => {
      // Must specify at least 3 options
      if (!Array.isArray(value) || value.length < 3) {
        const fieldValue = journeyContext.getDataForPage(waypoint)[fieldName]
        return [
          ValidationError.make({
            errorMsg: {
              inline: 'checkboxes:errors.min.inline',
              summary: 'checkboxes:errors.min.summary',
              variables: {
                count: fieldValue ? fieldValue.length : 0,
              },
            },
          }),
        ]
      }
      return []
    },
    sanitise: (value) => {
      if (Array.isArray(value)) {
        return value.map(String)
      }
      return undefined
    },
  }

  app.casa.addPage({
    waypoint: 'checkboxes',
    view: 'pages/checkboxes.njk',
    fields: [
      field('boxes').validators([
        r.required.make(),
        boxValidator,
      ]),
    ],
  })
}
