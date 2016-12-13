
export class MoodState {

  constructor({ priority, duration, mood }) {
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

  constructor(name, rgb, brightness) {
    this.name = name
    this.rgb = rgb
    this.brightness = brightness
  }

  getName() {
    return this.name
  }

  getColor() {
    return this.rgb
  }

  getBrightness() {
    return this.brightness
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
