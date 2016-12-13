/* @flow */
/* eslint global-require: 0, import/no-dynamic-require: 0 */

import glob from 'glob'
import Logger, { makeCliColor } from '@helpers/logger'
import type { Action } from '@helpers/socket'
import { MoodState, MoodColor } from '@base/mood'

const hooks = {}

glob('src/hooks/*.js', (err, files) => {
  files.forEach((file) => {
    const hook = require(`../${file}`)
    hooks[hook.name] = hook
  })
})

export default class Manager {

  handlers: Array<Function>
  states: Array<MoodState>
  logger: Logger

  brightness: number
  currentColor: ?Array<number>
  currentBrightness: ?number
  defaultState: MoodState

  task: ?number

  constructor(brightness: ?number) {
    this.handlers = []
    this.states = []
    this.logger = new Logger('manager')

    this.brightness = brightness || 100
    this.currentColor = null
    this.currentBrightness = null
    this.defaultState = new MoodState(0, -1, new MoodColor('normal'))
  }

  setBrightness(brightness: number) {
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

  send(color: ?Array<number>, brightness: ?number) {
    let updateNeeded = false

    // Check if we need to change color
    let newColor = color
    if (newColor === this.currentColor) {
      newColor = null
    } else {
      this.currentColor = newColor
      updateNeeded = true
    }

    // Check if we need to update brightness
    let newBrightness = typeof brightness === 'number' ? brightness : this.brightness
    if (newBrightness === this.currentBrightness) {
      newBrightness = null
    } else {
      this.currentBrightness = newBrightness
      updateNeeded = true
    }

    if (updateNeeded) {
      (async () => {
        const sending = []

        if (newColor) {
          const format = await makeCliColor(newColor[0], newColor[1], newColor[2])
          sending.push(`rgb: ${format}`)
        }

        if (newBrightness === 0) {
          sending.push('brightness: OFF')
        } else if (newBrightness) {
          sending.push(`brightness: ${newBrightness}%`)
        }

        this.logger.info(`Sending ${sending.join(', ')}`)
      })()
      this.handlers.forEach(cb => cb(newColor, newBrightness))
    }
  }

  dispatcher() {
    return (name: string, handler: Function) => {
      this.handlers.push(handler)
    }
  }

  start() {
    if (!this.task) {
      this.task = setInterval(() => {
        let currentState = this.defaultState
        this.states.forEach((state) => {
          state.tick()
          if (state.getPriority() > currentState.getPriority) {
            currentState = state
          }
        })
        this.send(currentState.getMood().getColor())
      }, 1000)
    }
  }

  stop() {
    if (typeof this.task === 'number') {
      clearInterval(this.task)
      this.task = null
    }
  }
}
