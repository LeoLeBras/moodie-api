/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'mirror',
  action: (method: string) => {
    // Only use GET_ANALYSIS packets
    if (method === 'GET_ANALYSIS') {
      return true
    }
    return null
  },
  make: (method: string, payload: Object) => {
    let mood
    if (payload.analysis.anger > 30) {
      mood = Moods.NERVOUS
    } else if (payload.analysis.joy > 30) {
      mood = Moods.HAPPY
    } else if (payload.analysis.sadness > 10) {
      mood = Moods.SAD
    } else {
      mood = Moods.CALM
    }

    return new MoodState(300, 30 * 60, mood)
  },
}
