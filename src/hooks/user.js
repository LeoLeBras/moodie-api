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
        pendingPacket = {
          type: '@@home/COME_BACK_HOME',
          payload: {},
        }
        manager.setBrightness(lastBrightness)
      }

      // Wait for 1m
      clearTimeout(aliveTimeout)
      aliveTimeout = setTimeout(() => {
        logger.info('Shutdown lights since user died...')
        // No user, switch off
        wasShutDown = true
        lastBrightness = manager.brightness
        manager.setBrightness(0)
      }, 60 * 1000)

      // Not ignored
      return true
    }

    // Invalid
    return null
  },
  make: () => {
    if (cameBackHome) {
      cameBackHome = false
      return new MoodState(100, 30 * 60, Moods.FOCUSED)
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
