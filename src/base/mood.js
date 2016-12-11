
export class MoodColor {

  constructor(name, rgb, brightness) {
    this.name = name
    this.rgb = rgb
    this.brightness = brightness || 100
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

export class MoodState {

  constructor({ priority, duration, mood }) {
    this.data = { priority, duration, mood }
  }

  getData() {
    return this.data
  }

}

export const Moods = {
  SAD: new MoodColor('sad', [255, 253, 56]),
  JOY: new MoodColor('joy', [252, 40, 252]),
  RELAX: new MoodColor('relax', [77, 136, 229]),
  CALM: new MoodColor('calm', [43, 254, 197]),
  DYNAMIC: new MoodColor('dynamic', [253, 152, 39]),
  WORK: new MoodColor('work', [152, 37, 251]),
}
