/* @flow */

import { Moods, MoodState } from '@base/mood'
import type { Action } from '@helpers/socket'

module.exports = {
  name: 'mirror',
  action: (method: Action) => {
    // Only use GET_ANALYSIS packets
    return method === 'GET_ANALYSIS'
  },
  make: (method: Action, payload: Object) => {
    let mood
    if (payload.analysis.joy > 30) {
      mood = Moods.JOY
    } else if (payload.analysis.sadness > 10) {
      mood = Moods.SAD
    } else {
      mood = Moods.CALM
    }

    return new MoodState(300, 30 * 60, mood)
  },
}
