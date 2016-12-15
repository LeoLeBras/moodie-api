/* @flow */
/* eslint require-yield: 0, global-require: 0, import/no-dynamic-require: 0 */

import koa from 'koa'
import http from 'http'
import io from 'socket.io'
import glob from 'glob'

import Manager from '@root/manager'
import config from '@root/config'

import messenger from '@helpers/socket'
import bridge from '@helpers/hue'
import cli from '@helpers/cli'
import Logger from '@helpers/logger'

// Logger: set global log level
Logger.setGlobalLevel(config.loglevel)

// Manager: Initialize
const manager = new Manager(config.bridge.brightness, config.bridge.intensity)
manager.start()

// Koa: initialize web server
const app = koa()
const server = http.createServer(app.callback())
const port = process.env.PORT || (config.server && config.server.port) || 3000
new Logger('koa').info(`Start koa server on port ${port} 📣`)

// Koa: return "Hello World" for all GET methods
app.use(function* start() {
  this.body = 'Hello World'
})

// Socket.io: initialize socket messaging
const socket = io(server)
messenger(({ watch, dispatch }) => {
  // A new connection is made, greet him
  manager.connect(dispatch)
  // Listen for incoming packets
  watch(x => manager.receive(dispatch, x))
})(socket, { logger: new Logger('socket'), server: true })

// Hue: find Hue bridge
bridge(manager.dispatcher(), {
  logger: new Logger('hue'),
  username: config.bridge.username,
  lights: config.bridge.lights,
})

// CLI: listen to terminal input
cli(manager, config)

// Koa: Listen events
server.listen(port)

// Task: start services
glob('src/services/*.js', (err, files) => {
  files.forEach((file) => {
    const service = require(`../${file}`).default
    manager.addService(service)
  })
})

