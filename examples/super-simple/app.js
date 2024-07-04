const { resolve } = require('node:path')
const fastifyCasa = require('../../index')

/** @type {import('fastify').FastifyPluginAsync} */
module.exports = async function simple (app) {
  // Register plugin with CASA config
  await app.register(fastifyCasa, {
    views: [
      resolve(__dirname, 'views'),
    ],
    session: {
      name: 'myappsessionid',
      secret: 'secret',
      ttl: 3_600,
      secure: false,
    },
    i18n: {
      dirs: [resolve(__dirname, 'locales')],
      locales: ['en', 'cy'],
    },
  })

  // Redirect from root
  app.casa.ancillaryRouter.get('/', (request, reply) => {
    reply.redirect('/page-1')
  })

  // Add page definitions
  app.casa.addPage({
    waypoint: 'page-1',
    view: 'pages/page-1.njk',
  })
  app.casa.addPage({
    waypoint: 'page-2',
    view: 'pages/page-2.njk',
  })
  app.casa.addPage({
    waypoint: 'page-3',
    view: 'pages/page-3.njk',
  })

  // Setup plan
  app.casa.plan.setRoute('page-1', 'page-2')
  app.casa.plan.setRoute('page-2', 'page-3')

  // CASA router things
  app.casa.ancillaryRouter.get('/ancillary-page', (request, reply) => {
    reply.render('pages/ancillary.njk', { name: request.query.name })
  })

  // Update CASA config (eg: for use in plugins)
  app.casa.configure((config) => {
    config.views.push(resolve(__dirname, 'extra'))
  })

  // Modify nunjucks block
  app.casa.nunjucks.modifyBlock('main', () => {
    return '<p class="govuk-body">Inserted content</p>'
  })

  // Add nunjucks filters / globals
  app.casa.nunjucks.addGlobal('name', 'Jim')
  app.casa.nunjucks.addFilter('spaceOut', function spaceOut (input) {
    return input.split('').join(' ')
  })
}
