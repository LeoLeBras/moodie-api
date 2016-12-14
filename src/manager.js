/* @flow */
/* eslint global-require: 0, import/no-dynamic-require: 0 */

import glob from 'glob'
import Logger, { makeCliColor } from '@helpers/logger'
import type { Action } from '@helpers/socket'
import { Mood, MoodState, MoodColor } from '@base/mood'

const hooks = {}

glob('src/hooks/*.js', (err, files) => {
  files.forEach((file) => {
    const hook = require(`../${file}`)
    hooks[hook.name] = hook
  })
})

export default class Manager {

  handlers: Array<Function>
  connections: Array<Function>
  states: Map<string, MoodState>
  logger: Logger

  brightness: number
  intensity: number
  currentColor: Array<number>
  currentBrightness: number
  defaultState: MoodState

  task: ?number = null

  constructor(brightness: ?number, intensity: ?number) {
    this.handlers = []
    this.connections = []
    this.states = new Map()
    this.logger = new Logger('manager')

    this.brightness = brightness || 100
    this.intensity = intensity || 100
    this.currentColor = [255, 255, 255]
    this.currentBrightness = this.brightness

    this.defaultState = new MoodState(0, -1, new MoodColor('normal'))
  }

  setBrightness(brightness: number) {
    this.brightness = brightness
    this.send(null, brightness)
  }

  setIntensity(intensity: number) {
    this.intensity = intensity
    this.send(this.currentColor, null)
  }

  connect(dispatcher: Function) {
    this.connections.push(dispatcher)
    if (this.handlers.length) {
      dispatcher({
        type: '@@hue/BRIDGE_SEARCH_SUCCEEDED',
        payload: {},
      })
    }
  }

  receive(dispatcher: Function, packet: Action) {
    const type = packet.type
    const payload = packet.payload
    const name = type.split('/')[0].replace('@@', '')
    const method = type.split('/')[1]
    const hook = hooks[name]
    if (hook) {
      const action = hook.action ? hook.action(method, payload, this) : true
      if (action === true) {
        if (hook.make) {
          const moodState = hook.make(method, payload, this)
          if (moodState) {
            this.logger.info(`Received packet ${packet.type}!`)
            this.addState(name, moodState)
            const color = moodState.getMood().getColor()
            this.send(color, this.brightness)
          } else {
            this.logger.warn(`Made packet ${packet.type}, but nothing returned`)
          }
        }
        if (hook.respond && dispatcher) {
          dispatcher(hook.respond(method, payload, this))
        }
      } else if (action === false) {
        this.logger.info(`Clearing packet ${name}`)
        this.removeState(name)
      } else {
        this.logger.info(`Ignoring packet ${packet.type}`)
      }
    } else {
      this.logger.warn(`Hook ${packet.type} not found`)
    }
  }

  addState(identifier: string, state: MoodState) {
    if (typeof identifier === 'string' && state instanceof MoodState) {
      this.states.set(identifier, state)
      return
    }

    if (typeof identifier !== 'string') {
      throw new Error(`Wrong parameters (identifier must be string, ${typeof identifier} given)`)
    }

    if (!state) {
      throw new Error('Wrong parameters (state cannot be null)')
    }

    if (!(state instanceof MoodState)) {
      throw new Error(`Wrong parameters (state must be MoodState, ${state.constructor.name} given)`)
    }
  }

  removeState(identifier: string) {
    this.states.delete(identifier)
  }

  makeColor(rgb: Array<number>) {
    const average = rgb.reduce((p, c) => p + c, 0) / 3
    return rgb.map(x => x + ((average - x) * ((100 - this.intensity) / 100))).map(Math.round)
  }

  send(color: ?Array<number>, brightness: ?number) {
    const sendColor = color ? this.makeColor(color) : this.currentColor
    const sendBrightness = typeof brightness === 'number' ? brightness : this.currentBrightness

    let updateNeeded = false

    if (sendColor.join(',') !== this.currentColor.join(',')) {
      this.currentColor = sendColor
      updateNeeded = true
    }

    if (sendBrightness !== this.currentBrightness) {
      this.currentBrightness = sendBrightness
      updateNeeded = true
    }

    if (updateNeeded) {
      // Log color
      (async () => {
        const sending = []

        const format = await makeCliColor(sendColor[0], sendColor[1], sendColor[2])
        sending.push(`rgb: ${format}`)

        if (sendBrightness === 0) {
          sending.push('brightness: OFF')
        } else if (sendBrightness) {
          sending.push(`brightness: ${sendBrightness}%`)
        }

        this.logger.info(`Sending ${sending.join(', ')}`)
      })()

      // Check if we have actually handlers
      if (!this.handlers.length) {
        this.logger.warn('No handler to send color to!')
      }

      // And send
      this.handlers.forEach(cb => cb(sendColor, sendBrightness))
    }
  }

  dispatcher() {
    return (name: string, handler: Function) => {
      this.logger.info(`Added handler: ${name}!`)
      this.handlers.push(handler)
    }
  }

  start() {
    if (!this.task) {
      this.task = setInterval(() => {
        let currentState = this.defaultState
        this.states.forEach((state, key) => {
          if (state.tick()) {
            if (state.getPriority() > currentState.getPriority()) {
              currentState = state
            }
          } else {
            this.states.delete(key)
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
