/* @flow */

import { Moods, MoodState } from '@base/mood'
import type { Action } from '@helpers/socket'

module.exports = {
  name: 'mirror',
  action: (packet: Action) => {
    if (packet.type.indexOf('/GET_ANALYSIS') > -1) {
      // Make packet
      return true
    }

    // Do not change
    return null
  },
  make: (packet: Action): MoodState => {
    if (packet.type.indexOf('/GET_ANALYSIS') > -1) {
      let mood
      if (packet.payload.analysis.joy > 30) {
        mood = Moods.JOY
      } else if (packet.payload.analysis.sadness > 10) {
        mood = Moods.SAD
      } else {
        mood = Moods.CALM
      }

      return new MoodState(300, 30 * 60, mood)
    }
    return null
  },
}
