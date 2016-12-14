/* @flow */

class Mood {
  getName() {
    throw new Error('Abstract method')
  }

  getColor() {
    throw new Error('Abstract method')
  }
}

export class MoodAmbient extends Mood {

  name: string
  rgb: Function

  constructor(name: ?string, rgb: Function) {
    super()
    this.name = name || 'Unknown'
    this.rgb = rgb
  }

  getName() {
    return this.name
  }

  getColor() {
    return this.rgb()
  }

}

export class MoodColor extends Mood {

  name: string
  rgb: Array<number>

  constructor(name: ?string, rgb: ?Array<number>) {
    super()
    this.name = name || 'Unknown'
    this.rgb = rgb || [255, 255, 255]
  }

  getName() {
    return this.name
  }

  getColor() {
    return this.rgb
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
    this.duration -= 1
    if (this.duration <= 0) {
      // Invalid state
      return false
    }

    if (typeof this.decreasePerSecond === 'number' && this.decreasePerSecond) {
      this.priority -= this.decreasePerSecond
    }
    return true
  }

}
