/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'mood',
  action: (method: string) => {
    return method === 'SELECT_MOOD'
  },
  make: (method: string, payload: Object) => {
    const key = payload.mood.toUpperCase()
    const mood = Moods[key]
    if (mood) {
      return new MoodState(1000, 24 * 60 * 60, mood)
    }
    return null
  },
}
