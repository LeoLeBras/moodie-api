/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'mirror',
  action: (method: string) => {
    // Only use GET_ANALYSIS packets
    return method === 'GET_ANALYSIS'
  },
  make: (method: string, payload: Object) => {
    let mood
    if (payload.analysis.joy > 30) {
      mood = Moods.HAPPY
    } else if (payload.analysis.sadness > 10) {
      mood = Moods.SAD
    } else {
      mood = Moods.CALM
    }

    return new MoodState(300, 30 * 60, mood)
  },
}
