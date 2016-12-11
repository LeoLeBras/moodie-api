/* eslint global-require: 0, import/no-dynamic-require: 0 */

import glob from 'glob'
import Logger from '@helpers/logger'
import type { Action } from '@helpers/socket'

const hooks = {}
const handlers = []
const logger = new Logger('manager')

glob('src/hooks/*.js', (err, files) => {
  files.forEach((file) => {
    const hook = require(`../${file}`)
    hooks[hook.name] = hook
  })
})

const manager = {
  receive: (packet: Action) => {
    const type = packet.type.split('/')
    const name = type[0].replace('@@', '')
    const hook = hooks[name]
    if (hook) {
      const moodState = hook.make(packet)
      if (moodState) {
        logger.info(`Received packet ${packet.type}!`)
        const color = moodState.getData().mood.getColor()
        const brightness = moodState.getData().mood.getBrightness()
        manager.send(color, brightness)
      } else {
        logger.warn(`Packet ${packet.type} discarded`)
      }
    } else {
      logger.warn(`Packet ${packet.type} not found`)
    }
  },
  send: (color, brightness) => handlers.forEach(cb => cb(color, brightness)),
  dispatcher: (name, handler) => handlers.push(handler),
}

export default manager
