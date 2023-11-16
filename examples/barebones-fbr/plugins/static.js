'use strict'

const path = require('node:path')
const express = require('express')

/** @param {import('fastify').FastifyInstance} app */
module.exports = async function staticRoutes (app, opts) {
  // Example: Adding a custom static asset route
  // Attach these to the `staticRouter`
  app.casa.staticRouter.get('/css/application.css', (req, res, next) => {
    res.set('content-type', 'text/css')
    res.send('.govuk-header { background-color: #003078; }')
  })

  app.casa.staticRouter.use('/assets', express.static(path.resolve(__dirname, '../assets')))
  app.casa.staticRouter.all('/assets', (req, res) => res.status(404).send('Not found'))
}
