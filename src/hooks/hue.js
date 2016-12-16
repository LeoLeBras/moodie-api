/* @flow */

import Manager from '@root/manager'
import config from '@root/config'

let lastBrightness = config.bridge.brightness

module.exports = {
  name: 'hue',
  action: (method: string) => {
    return ['BRIDGE_SEARCH_REQUESTED', 'CHANGE_BRIGHTNESS', 'CHANGE_SATURATION', 'TURN_OFF', 'TURN_ON'].includes(method)
  },
  respond: (method: string, payload: Object, manager: Manager) => {
    if (method === 'BRIDGE_SEARCH_REQUESTED') {
      if (manager.handlers.length) {
        return [{
          type: '@@hue/BRIDGE_SEARCH_SUCCEEDED',
          payload: {},
        }, {
          type: '@@hue/GET_INITIAL_STATE',
          payload: {
            isOn: manager.brightness > 0,
          },
        }]
      }
    } else if (method === 'CHANGE_BRIGHTNESS') {
      if (payload.brightness >= 0 && payload.brightness <= 100) {
        manager.setBrightness(payload.brightness)
        lastBrightness = payload.brightness
      }
    } else if (method === 'CHANGE_SATURATION') {
      if (payload.saturation >= 0 && payload.saturation <= 100) {
        manager.setIntensity(payload.saturation)
      }
    } else if (method === 'TURN_ON') {
      manager.setBrightness(lastBrightness || 50)
    } else if (method === 'TURN_OFF') {
      lastBrightness = manager.brightness
      manager.setBrightness(0)
    }
    return null
  },
}
