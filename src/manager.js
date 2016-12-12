/* eslint global-require: 0, import/no-dynamic-require: 0 */

import glob from 'glob'
import Logger from '@helpers/logger'
import type { Action } from '@helpers/socket'

const hooks = {}

glob('src/hooks/*.js', (err, files) => {
  files.forEach((file) => {
    const hook = require(`../${file}`)
    hooks[hook.name] = hook
  })
})

export default class Manager {

  constructor(brightness) {
    this.handlers = []
    this.logger = new Logger('manager')
    this.brightness = brightness || 100
  }

  setBrightness(brightness) {
    this.brightness = brightness
  }

  receive(packet: Action) {
    const type = packet.type.split('/')
    const name = type[0].replace('@@', '')
    const hook = hooks[name]
    if (hook) {
      const moodState = hook.make(packet)
      if (moodState) {
        this.logger.info(`Received packet ${packet.type}!`)
        const color = moodState.getData().mood.getColor()
        this.send(color, this.brightness)
      } else {
        this.logger.warn(`Packet ${packet.type} discarded`)
      }
    } else {
      this.logger.warn(`Packet ${packet.type} not found`)
    }
  }

  send(color, brightness) {
    const newBrightness = typeof brightness === 'number' ? brightness : this.brightness
    this.handlers.forEach(cb => cb(color, newBrightness))
  }

  dispatcher() {
    return (name, handler) => {
      this.handlers.push(handler)
    }
  }
}
