/* @flow */

import { Moods, MoodState } from '@base/mood'
import type { Action } from '@helpers/socket'

module.exports = {
  name: 'weather',
  action: (packet: Action) => {
    // Return true (= make packet) if weather is different from clear
    return packet.type.indexOf('/CLEAR') === -1
  },
  make: (packet: Action): MoodState => {
    if (packet.type.indexOf('/RAIN') > -1) {
      return new MoodState(50, 15 * 60, Moods.SAD)
    } else if (packet.type.indexOf('/STORM') > -1) {
      return new MoodState(50, 15 * 60, Moods.CALM)
    }
    return null
  },
}
