const fastify = require('fastify')
const casaApp = require('./app')

const app = fastify({ logger: true })
app.register(casaApp)
app.listen({ port: 3_000 })
