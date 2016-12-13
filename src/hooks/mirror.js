/* @flow */

import { Moods, MoodState } from '@base/mood'
import type { Action } from '@helpers/socket'

module.exports = {
  name: 'mirror',
  make: (packet: Action): MoodState => {
    if (packet.type.indexOf('/GET_ANALYSIS') > -1) {
      return new MoodState({
        priority: 300,
        duration: 5 * 60,
        mood: packet.payload.analysis.joy > 30 ? Moods.JOY : Moods.SAD,
      })
    }
    return null
  },
}
