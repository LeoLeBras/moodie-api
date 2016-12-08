/* @flow */

import koa from 'koa'
import http from 'http'

// Initialyze koa server
const app = koa()
const server = http.createServer(app.callback())
const port = process.env.PORT || 3000

// Return "Hello World" for all GET methods
app.use(function* run() {
  this.body = 'Hello World'
})

// Initialyze socket.io
const io = require('socket.io')(server)

// Listen web sockets
io.on('connection', (socket) => {
  socket.on('test', (message) => {
    console.log(message)
  })
})

// Listen events
server.listen(port, () => console.log(`listening on ${port} 😎 💪`))
