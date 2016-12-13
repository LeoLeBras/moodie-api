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
    this.states = []
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
        this.states.push(moodState)
        const color = moodState.getMood().getColor()
        this.send(color, this.brightness)
      } else {
        this.logger.warn(`Packet ${packet.type} discarded`)
      }
    } else {
      this.logger.warn(`Packet ${packet.type} not found`)
    }
  }

  send(color, brightnessOverride) {
    const brightness = typeof brightnessOverride === 'number' ? brightnessOverride : this.brightness
    this.handlers.forEach(cb => cb(color, brightness))
  }

  dispatcher() {
    return (name, handler) => {
      this.handlers.push(handler)
    }
  }

  start() {
    if (!this.task) {
      this.task = setInterval(() => {
        // ...
      }, 1000)
    }
  }

  stop() {
    clearInterval(this.task)
    this.task = null
  }
}
