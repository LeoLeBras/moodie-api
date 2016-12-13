/* @flow */

class Mood {
  getName() {
    throw new Error('Abstract method')
  }

  getColor(intensity: ?number) {
    throw new Error('Abstract method')
  }

  getIntensity() {
    throw new Error('Abstract method')
  }

  computeColor(rgb: Array<number>, intensity: number) {
    const average = rgb.reduce((p, c) => p + c, 0) / 3
    return rgb.map(x => x + ((average - x) * ((100 - intensity) / 100))).map(Math.round)
  }
}

export class MoodAmbient extends Mood {

  name: string
  rgb: Function
  intensity: Function

  constructor(name: ?string, rgb: Function, intensity: Function) {
    super()
    this.name = name || 'Unknown'
    this.rgb = rgb
    this.intensity = intensity
  }

  getName() {
    return this.name
  }

  getColor(intensity: ?number) {
    if (typeof intensity === 'number') {
      if (intensity >= 100) {
        return this.rgb()
      }
      return this.computeColor(this.rgb(), intensity)
    }

    return this.computeColor(this.rgb(), this.intensity())
  }

  getIntensity() {
    return this.intensity()
  }

}

export class MoodColor extends Mood {

  name: string
  rgb: Array<number>
  intensity: number
  rgbWithIntensity: Array<number>

  constructor(name: ?string, rgb: ?Array<number>, intensity: ?number) {
    super()
    this.name = name || 'Unknown'
    this.rgb = rgb || [255, 255, 255]
    this.intensity = intensity || 100

    this.rgbWithIntensity = this.computeColor(this.rgb, this.intensity)
  }

  getName() {
    return this.name
  }

  getColor(intensity: ?number) {
    if (typeof intensity === 'number') {
      if (intensity >= 100) {
        return this.rgb
      }
      return this.computeColor(this.rgb, intensity)
    }

    return this.rgbWithIntensity
  }

  getIntensity() {
    return this.intensity
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

type Options = {
  decreasePerSecond: number
}

export class MoodState {

  priority: number
  duration: number
  mood: Mood

  decreasePerSecond: ?number

  constructor(priority: number, duration: number, mood: Mood) {
    this.priority = priority
    this.duration = duration
    this.mood = mood
  }

  options({ decreasePerSecond }: Options) {
    this.mood = Moods.SAD
    console.log(decreasePerSecond * 10)
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

  tick() {
    if (typeof this.decreasePerSecond === 'number' && this.decreasePerSecond) {
      this.priority -= this.decreasePerSecond
    }
  }

}
