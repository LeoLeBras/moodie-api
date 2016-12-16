/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'musics',
  action: (method: string) => {
    return method === 'TRACK_ANALYSIS'
  },
  make: (method: string, payload: Object) => {
    if (method === 'TRACK_ANALYSIS') {
      if (payload.valence > 0.65) {
        return new MoodState(200, 5 * 60, Moods.HAPPY)
      } else if (payload.energy > 0.65) {
        return new MoodState(200, 5 * 60, Moods.MOTIVATED)
      } else if (payload.valence < 0.3) {
        return new MoodState(200, 5 * 60, Moods.SAD)
      } else if (payload.energy < 0.3) {
        return new MoodState(200, 5 * 60, Moods.CALM)
      }
    }
    return null
  },
}
