/* @flow */
/* eslint require-yield: 0 */

import koa from 'koa'
import http from 'http'
import io from 'socket.io'
import readline from 'readline'

import messenger from '@helpers/socket'
import bridge from '@helpers/hue'
import Logger from '@helpers/logger'

import manager from './manager'
import config from './config'

// Logger: set global log level
Logger.setGlobalLevel(config.loglevel)

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
  dispatch('welcome')
  // Listen for incoming packets
  watch(x => manager.receive(x))
})(socket, { logger: new Logger('socket'), server: true })

// Hue: find Hue bridge
bridge(manager.dispatcher, {
  logger: new Logger('hue'),
  username: config.bridge.username,
  lights: config.bridge.lights,
})

// CLI: listen to terminal input
const cliLogger = new Logger('cli', 9)
readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
}).on('line', (cmd) => {
  const args = cmd.split(' ')
  // Change logging level
  if (args[0] === 'log') {
    const newLevel = args.length === 2 ? parseInt(args[1]) : config.logLevel
    if (newLevel >= -1 && newLevel < 10) {
      Logger.setGlobalLevel(newLevel)
      cliLogger.info(`Logging level set to ${newLevel}`)
    } else {
      cliLogger.error(`Incorrect number: ${args[1]}`)
    }
  }

  // Change light color
  if (args[0] === 'rgb') {
    if (args.length < 4) {
      cliLogger.error('Missing args (must be 3 or 4)')
    } else {
      // Get values from args
      const rgb = [args[1], args[2], args[3]].map(x => parseInt(x))
      const brightness = args.length === 5 ? parseInt(args[4]) : 100

      // Test valid number
      if (rgb.concat(brightness).some(isNaN)) {
        cliLogger.error('Incorrect number')
      } else {
        // Then send color
        cliLogger.info('Dispatching color...')
        manager.send(rgb, brightness)
      }
    }
  }
})

// Koa: Listen events
server.listen(port)
