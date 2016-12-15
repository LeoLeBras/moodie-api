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
  MOTIVATED: new MoodColor('motivated', [253, 152, 39]),
  SAD: new MoodColor('sad', [255, 253, 56]),
  CALM: new MoodColor('calm', [108, 167, 84]),
  NERVOUS: new MoodColor('nervous', [43, 254, 197]),
  FOCUSED: new MoodColor('focused', [152, 37, 251]),
  HAPPY: new MoodColor('happy', [252, 40, 252]),
}

export class MoodState {

  priority: number
  duration: number
  mood: Mood

  constructor(priority: number, duration: number, mood: Mood) {
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

  tick() {
    this.duration -= 1
    return this.duration > 0
  }

}
