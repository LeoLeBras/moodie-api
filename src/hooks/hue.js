/* @flow */

import Manager from '@root/manager'
import type { Action } from '@helpers/socket'

module.exports = {
  name: 'hue',
  respond: (method: Action, payload: Object, manager: Manager) => {
    if (manager.handlers.length) {
      return {
        type: '@@hue/BRIDGE_SEARCH_SUCCEEDED',
        payload: {},
      }
    }
    return null
  },
}
