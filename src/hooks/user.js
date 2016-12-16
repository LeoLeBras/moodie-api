/* @flow */

import Logger from '@helpers/logger'
import Manager from '@root/manager'
import { MoodState, Moods } from '@base/mood'
import config from '@root/config'

let wasShutDown = false
let aliveTimeout = null
let pendingPacket = null
let cameBackHome = false
let lastBrightness = config.bridge.brightness

const logger = new Logger('alive')

module.exports = {
  name: 'user',
  action: (method: string, payload: Object, manager: Manager) => {
    if (method === 'I_AM_ALIVE') {
      // Check if we get back home
      if (wasShutDown) {
        logger.info('User came back home!')
        wasShutDown = false
        cameBackHome = true
        pendingPacket = [{
          type: '@@home/COME_BACK_HOME',
          payload: {},
        }, {
          type: '@@hue/GET_INITIAL_STATE',
          payload: {
            isOn: true,
          },
        }]
        manager.setBrightness(lastBrightness || 50)
      }

      // Wait for 1m
      clearTimeout(aliveTimeout)
      aliveTimeout = setTimeout(() => {
        logger.info('Shutdown lights since user died...')
        // No user, switch off
        wasShutDown = true
        lastBrightness = manager.brightness
        manager.setBrightness(0)
      }, 30 * 1000)

      // Not ignored
      return true
    } else if (method === 'GO_TO_SLEEP') {
      return true
    }

    // Invalid
    return null
  },
  make: (method: string) => {
    if (cameBackHome) {
      cameBackHome = false
      // return new MoodState(100, 30 * 60, Moods.FOCUSED)
    } else if (method === 'GO_TO_SLEEP') {
      return new MoodState(250, 60 * 60, Moods.CALM)
    }
    return null
  },
  respond: () => {
    if (pendingPacket) {
      const sendPacket = pendingPacket
      pendingPacket = null
      return sendPacket
    }
    return null
  },
}
