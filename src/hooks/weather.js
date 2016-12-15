/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'weather',
  action: (method: string) => {
    // Return true (= make packet) if weather is different from clear
    return method !== 'CLEAR'
  },
  make: (method: string) => {
    if (method === 'RAIN') {
      return new MoodState(50, 15 * 60, Moods.SAD)
    } else if (method === 'STORM') {
      return new MoodState(50, 15 * 60, Moods.CALM)
    }
    return null
  },
}
