'use strict'

// Read the .env file.
require('dotenv').config()

// Require the framework
const Fastify = require('fastify')

// Require library to exit fastify process, gracefully (if possible)
const closeWithGrace = require('close-with-grace')

let logger = true
if (process.stdout.isTTY) {
  logger = {
    transport: {
      target: 'pino-pretty',
    },
  }
}

// Instantiate Fastify with some config
const app = Fastify({ logger })

// CASA app registered on '/barebones' path, encapsulated
const casaApp = require('./app.js')
app.register(casaApp, { prefix: '/barebones' })

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 }, async function ({ signal, err, manual }) {
  if (err) {
    app.log.error(err)
  }
  await app.close()
})

app.addHook('onClose', (instance, done) => {
  closeListeners.uninstall()
  done()
})

// Start listening.
app.listen({ port: process.env.PORT || 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
