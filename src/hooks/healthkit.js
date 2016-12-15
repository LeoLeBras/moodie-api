/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'healthkit',
  action: (method: string) => {
    // Update mood
    if (['GET_STEP_COUNT', 'START_ACTIVITY', 'STOP_ACTIVITY'].includes(method)) {
      return true
    }

    // Ignore
    return null
  },
  make: (method: string, payload: Object) => {
    if (method === 'GET_STEP_COUNT') {
      if (payload.level >= 4) {
        return new MoodState(150, 30 * 60, Moods.CALM)
      }
    } else if (method === 'START_ACTIVITY') {
      return new MoodState(180, 30 * 60, Moods.DYNAMIC)
    } else if (method === 'STOP_ACTIVITY') {
      return new MoodState(200, 5 * 60, Moods.DYNAMIC)
    } else if (method === 'INCREASE_HEART_RATE') {
      if (payload.value >= 120) {
        return new MoodState(120, 10 * 60, Moods.ANGRY)
      }
    }

    return null
  },
}
