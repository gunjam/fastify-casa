const { resolve } = require('node:path')
const { waypointUrl } = require('../../../../index')

/**
 * waypoint[] = list of waypoints on which CYA will be enabled
 *
 * @type {import('fastify').FastifyPluginAsync}
 */
module.exports = async function checkYourAnswers (app, opts) {
  const { waypoints = ['check-your-answers'] } = opts
  const reSlugger = /[^a-z0-9-]+/ig

  function slug (waypoint) {
    waypoint.replace(reSlugger, '-')
  }

  function stringify (value) {
    // TODO: Handle all data types. See issue #63
    return value
  };

  function configure (config) {
    // Structure pages to make it more easily searchable by waypoint
    const pages = {}
    for (const page of config.pages) {
      pages[page.waypoint] = page
    }

    // Add a views directory
    config.views.push(resolve(__dirname, 'views'))

    for (const waypoint of waypoints) {
      function preRender (req, res, next) {
        // Grab a list of all pages up to this point
        const traversed = config.plan.traverse(req.casa.journeyContext)
        const sections = []

        for (const wp of traversed) {
          const fieldLink = waypointUrl({
            journeyContext: req?.casa?.journeyContext,
            waypoint: wp,
            mountUrl: `${req.baseUrl}/`,
            edit: true,
            editOrigin: waypointUrl({
              journeyContext: req?.casa?.journeyContext,
              waypoint,
              mountUrl: `${req.baseUrl}/`,
            }),
          })

          // TODO: Need to handle exit nodes (e.g. waypoints using `url://` protocol)
          sections.push({
            waypoint: req.t(`${slug(wp)}:pageTitle`),
            rows: (pages?.[wp]?.fields ?? []).filter(f => f.meta.persist).map((field) => ({
              key: {
                text: req.t(`${slug(wp)}:field.${field.name}.label`),
              },
              value: {
                text: stringify(req.casa.journeyContext.data?.[wp]?.[field.name]),
              },
              actions: {
                items: [{
                  href: `${fieldLink}#f-${field.name}`,
                  text: req.t('check-your-answers:change'),
                  visuallyHiddenText: req.t(`${slug(wp)}:field.${field.name}.label`),
                  classes: 'govuk-link--no-visited-state',
                }],
              },
            })),
          })
        }

        res.locals.sections = sections.filter(s => s.rows.length)
        next()
      }

      app.casa.addPage({
        waypoint,
        view: 'check-your-answers/template.njk',
        hooks: [{ hook: 'prerender', middleware: preRender }],
        fields: [],
      })
    }
  }

  app.casa.configure(configure)
}
