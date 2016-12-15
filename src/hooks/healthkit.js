/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'healthkit',
  action: (method: string) => {
    // Update mood
    if (['GET_SLEEP_SAMPLE', 'GET_STEP_COUNT', 'START_ACTIVITY', 'STOP_ACTIVITY'].includes(method)) {
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
      return new MoodState(180, 30 * 60, Moods.MOTIVATED)
    } else if (method === 'STOP_ACTIVITY') {
      return new MoodState(200, 5 * 60, Moods.MOTIVATED)
    } else if (method === 'INCREASE_HEART_RATE') {
      if (payload.value >= 120) {
        return new MoodState(120, 10 * 60, Moods.NERVOUS)
      }
    } else if (method === 'GET_SLEEP_SAMPLE') {
      if (payload.sleep.value === 'INBED') {
        const start = new Date(payload.sleep.endDate)
        const end = new Date(payload.sleep.endDate)
        const hours = (end.getTime() - start.getTime()) / 1000 / 3600
        if (hours < 8) {
          return new MoodState(100, 15 * 60, Moods.FOCUSED)
        }
      }
    }

    return null
  },
}
