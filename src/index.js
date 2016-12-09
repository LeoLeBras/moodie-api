/* @flow */
/* eslint no-console: 0 */

import koa from 'koa'
import http from 'http'
import { run as runSocket } from '@helpers/socket'
import { run as runHue } from '@helpers/hue'
import config from './config'

// Initialyze koa server
const app = koa()
const server = http.createServer(app.callback())
const port = process.env.PORT || 3000

// Logs
console.log('Start koa server 📣')
console.log(`Listening on ${port} 😎 💪`)

// Return "Hello World" for all GET methods
app.use(function* start() {
  this.body = 'Hello World'
})

// Initialyze socket.io
const socket = require('socket.io')(server)

// Run sockets
runSocket(({ watch, dispatch }) => {
  dispatch('hello')
  watch(() => {
    // ...
  })
})(socket, { debug: true, server: true })

// Find Hue bridge
runHue({ debug: true, username: config.bridge.username, lights: config.bridge.lights })

// Listen events
server.listen(port)
