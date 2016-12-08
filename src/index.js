/* @flow */
/* eslint no-console: 0 */

import koa from 'koa'
import http from 'http'
import { run } from '@helpers/socket'

// Initialyze koa server
const app = koa()
const server = http.createServer(app.callback())
const port = process.env.PORT || 3000

// Logs
console.log(`Start koa server 📣`)
console.log(`Listening on ${port} 😎 💪`)

// Return "Hello World" for all GET methods
app.use(function* run() {
  this.body = 'Hello World'
})

// Initialyze socket.io
const socket = require('socket.io')(server)

// Run sockets
run(({ watch, dispatch }) => {
  dispatch('hello')
  watch(() => {
    // ...
  })
})(socket, { debug: true, server: true })

// Listen events
server.listen(port)
