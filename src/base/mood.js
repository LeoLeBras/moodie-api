/* @flow */

export class MoodState {

  priority: number
  duration: number
  mood: MoodColor

  constructor(priority: number, duration: number, mood: MoodColor) {
    this.priority = priority
    this.duration = duration
    this.mood = mood
  }

  getPriority() {
    return this.priority
  }

  getDuration() {
    return this.duration
  }

  getMood() {
    return this.mood
  }

}

export class MoodColor {

  name: string
  rgb: Array<number>
  intensity: number
  rgbWithIntensity: Array<number>

  constructor(name: ?string, rgb: ?Array<number>, intensity: ?number) {
    this.name = name || 'Unknown'
    this.rgb = rgb || [255, 255, 255]
    this.intensity = intensity || 100

    this.rgbWithIntensity = this.computeColor(this.intensity)
  }

  getName() {
    return this.name
  }

  getColor(intensity: ?number) {
    if (typeof intensity === 'number') {
      if (intensity >= 100) {
        return this.rgb
      }
      return this.computeColor(intensity)
    }

    return this.rgbWithIntensity
  }

  getIntensity() {
    return this.intensity
  }

  computeColor(intensity: number) {
    const average = this.rgb.reduce((p, c) => p + c, 0) / 3
    return this.rgb.map(x => x + ((average - x) * ((100 - intensity) / 100))).map(Math.round)
  }

}

export const Moods = {
  DYNAMIC: new MoodColor('dynamic', [253, 152, 39]),
  SAD: new MoodColor('sad', [255, 253, 56]),
  CALM: new MoodColor('calm', [108, 167, 84]),
  ANGRY: new MoodColor('angry', [43, 254, 197]),
  FOCUS: new MoodColor('focus', [152, 37, 251]),
  JOY: new MoodColor('joy', [252, 40, 252]),
}
