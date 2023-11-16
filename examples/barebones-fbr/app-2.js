// The CASA app is encapsulated in /barebones/ so it should not be available
// in this plugin
module.exports = async function app2 (app, opts) {
  app.get('/check', function handler (request, reply) {
    reply.send(`casa available: ${this.hasDecorator('casa')}`)
  })
}
