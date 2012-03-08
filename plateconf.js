// plateconf.js
var plate = require('plate')
  , Loader = require('plate/lib/plugins/loaders/filesystem').Loader
  , path = require('path')

module.exports = function configure(app, dir) {
  var plugin = new Loader([dir]).getPlugin()

  app.register('.html', plate)
  app.set('views', dir)
  app.set('view engine', 'html')
  plate.Template.Meta.registerPlugin('loader', plugin)
}
