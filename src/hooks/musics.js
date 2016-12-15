/* @flow */

import { Moods, MoodState } from '@base/mood'

module.exports = {
  name: 'musics',
  action: (method: string) => {
    return method === 'TRACK_ANALYSIS'
  },
  make: (method: string, payload: Object) => {
    if (method === 'TRACK_ANALYSIS') {
      if (payload.energy > 0.7) {
        return new MoodState(70, 5 * 60, Moods.DYNAMIC)
      } else if (payload.valence > 0.7) {
        return new MoodState(70, 5 * 60, Moods.JOY)
      } else if (payload.valence < 0.3) {
        return new MoodState(70, 5 * 60, Moods.SAD)
      } else if (payload.energy < 0.3) {
        return new MoodState(70, 5 * 60, Moods.CALM)
      }
    }
    return null
  },
}
