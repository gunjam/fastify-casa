# fastify-casa

A fastify plugin that wraps the [CASA](https://github.com/dwp/govuk-casa) express framework, providing decorator methods to journeys, pages, routes and templates.

For more information on building a CASA app, please refer to the [CASA documentation](https://github.com/dwp/govuk-casa/blob/main/docs/index.md).

## Installation

```
npm i fastify-casa
```

## Usage

Register the `fastify-casa` plugin using the same [config options](https://github.com/dwp/govuk-casa/blob/main/docs/setup.md#options) you would in a standard CASA app:

```javascript
import { join } from 'node:path'
import fastify from 'fastify'
import casa from 'fastify-casa'

const app = fastify()

await app.register(casa, {
  views: [
    join(import.meta.dirname, 'views'),
  ],
  session: {
    name: 'mysession',
    secret: 'secret',
    ttl: 3_600,
    secure: false,
  },
  i18n: {
    dirs: [join(import.meta.dirname, 'locales')],
    locales: ['en', 'cy'],
  },
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

app.listen({ port: 3_000 })
```

You can omit passing a plan or pages array to the config options and the plugin will create empty ones internally, which you can later amend using `app.casa.plan` and `app.casa.addPage()`.

> [!NOTE]
> CASA specific request and respone methods are currently only available within [CASA hooks](https://github.com/dwp/govuk-casa/blob/main/docs/hooks.md) and [CASA specific routers](#casa-routers) and not in standard fastify hooks and routers.

### Plan

The CASA plan is added to the fastify instance available on `app.casa.plan`, where you can access all of the standard [plan methods](https://github.com/dwp/govuk-casa/blob/main/docs/plan.md):

```javascript
app.casa.plan.setRoute('a', 'b', (r, c) => c.data.a.ticked === true)
app.casa.plan.setRoute('a', 'c', (r, c) => c.data.a.ticked !== true)
app.casa.plan.addSequence('b', 'c', 'd', 'e')
```

### Pages

You can add pages to your CASA app by calling `app.casa.addPage()` with the standard [CASA pages config](https://github.com/dwp/govuk-casa/blob/main/docs/pages.md):

```javascript
app.casa.addPage({
  // The waypoint this Page represents
  waypoint: 'details',

  // The Nunjucks template that renders this page
  view: 'pages/details.njk',

  // Hooks that will only run on requests to this Page
  hooks: [{ ... }],

  // Information about all the fields on your page form
  fields: [{ ... }],
})
```

Page waypoint paths will inherit the prefix of the encapsulation context they're in, eg:

```javascript
app.register((instance, opts) => {
  instance.casa.addPage({
    // URL path /base-path/details
    waypoint: 'details',
    view: 'pages/details.njk',
  })
}, { prefix: '/base-path' })
```

This can allow a file based routing style project setup, as shown in the [example project](examples/barebones-fbr).

### Events

[CASA events](https://github.com/dwp/govuk-casa/blob/main/docs/events.md) can be set using `app.casa.addEvent()`:

```javascript
app.casa.addEvent({
  event: 'waypoint-change',
  waypoint: 'waypoint',
  field: 'name',
  handler: ({ journeyContext }) => {},
})
```

### CASA Routers

Setting up [CASA mutable routers](https://github.com/dwp/govuk-casa/blob/main/docs/guides/mutable-routers.md) is availble using `app.casa.ancillaryRouter`, `app.casa.journeyRouter` and `app.casa.staticRouter`, eg:

```javascript
app.casa.ancillaryRouter.get('/', (request, reply) => {
  reply.redirect('/page-1')
})
app.casa.journeyRouter.get('/page', (request, reply) => {
  reply.render('/page-1')
})
app.casa.staticRouter.get('/css/application.css', (request, reply) => {
  res.set('content-type', 'text/css')
  res.send('.govuk-header { background-color: #003078; }')
})
```

### Nunjucks decorators

There are [nunjucks](https://mozilla.github.io/nunjucks/api.html) decorator functions available which will allow you to add more template paths, globals, filters as well as modify nunjucks blocks as shown in the [CASA plugins documentation](https://github.com/dwp/govuk-casa/blob/main/docs/plugins.md#injecting-content-into-templates).

```javascript
// Add a nunjucks filter
app.casa.nunjucks.addFilter('uppercase', (str) => str.toUpperCase())

// Add a global var to the nunjucks environment
app.casa.nunjucks.addGlobal('version', '1.2.0')

// Add one or more views paths
app.casa.nunjucks.addViews('./path-to-views')
app.casa.nunjucks.addViews(['./views-1', '/views-2'])

// Modify the content of a nunjucks template {% block %}
app.casa.nunjucks.modifyBlock('blockName', () => {
  return `This will add some content from another template at the beginning of
    the "blockName" block: {% include "my-plugin/thing.njk" %}`;
})
```

## CASA plugins

[CASA specific plugins](https://github.com/dwp/govuk-casa/blob/main/docs/plugins.md) can be loaded using `app.casa.register`, although you'd be better off writing fastify plugins that make use of fastify-casa functionality.

```javascript
app.casa.register(somePlugin())
```
