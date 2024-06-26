const { resolve } = require('node:path')
const fastifyCasa = require('../../index')

/** @param {import('fastify').FastifyInstance} fastify */
module.exports = async function (fastify, opts) {
  // Register plugin with CASA config
  await fastify.register(fastifyCasa, {
    views: [
      resolve(__dirname, 'views'),
    ],
    session: {
      name: 'myappsessionid',
      secret: 'secret',
      ttl: 3600,
      secure: false,
    },
    i18n: {
      dirs: [resolve(__dirname, 'locales')],
      locales: ['en', 'cy'],
    },
  })

  // Redirect from root
  fastify.casa.ancillaryRouter.get('/', (request, reply) => {
    reply.redirect('/page-1')
  })

  // Add page definitions
  fastify.casa.addPage({
    waypoint: 'page-1',
    view: 'pages/page-1.njk',
  })
  fastify.casa.addPage({
    waypoint: 'page-2',
    view: 'pages/page-2.njk',
  })
  fastify.casa.addPage({
    waypoint: 'page-3',
    view: 'pages/page-3.njk',
  })

  // Setup plan
  fastify.casa.plan.setRoute('page-1', 'page-2')
  fastify.casa.plan.setRoute('page-2', 'page-3')

  // CASA router things
  fastify.casa.ancillaryRouter.get('/ancillary-page', (request, reply) => {
    reply.render('pages/ancillary.njk', { name: request.query.name })
  })

  // Update CASA config (eg: for use in plugins)
  fastify.casa.configure((config) => {
    config.views.push(resolve(__dirname, 'extra'))
  })

  // Modify nunjucks block
  fastify.casa.nunjucks.modifyBlock('main', () => {
    return '<p class="govuk-body">Inserted content</p>'
  })

  // Add nunjucks filters / globals
  fastify.casa.nunjucks.addGlobal('name', 'Jim')
  fastify.casa.nunjucks.addFilter('spaceOut', function (input) {
    return input.split('').join(' ')
  })
}
