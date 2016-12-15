/* @flow */

import colors from 'colors/safe'
import cp from 'child_process'

export const makeCliColor = (r: number, g: number, b: number, cb: ?Function) => {
  return new Promise((resolve) => {
    return cp.exec(`printf "|\x1b[48;2;${r};${g};${b}m   \x1b[0m|"`, (err, stdout) => {
      return resolve(stdout)
    })
  }).then(cb || (x => x))
}

let globalLogLevel = 0

class Logger {

  static app: Logger

  prefix: string
  logLevel: mixed

  static setGlobalLevel(level) {
    globalLogLevel = level
  }

  static getGlobalLevel() {
    return globalLogLevel
  }

  constructor(prefix: string, logLevel: ?number) {
    this.prefix = `[${prefix}]`
    this.logLevel = typeof logLevel === 'undefined'
      ? Logger.getGlobalLevel
      : logLevel
  }

  error(...items: any) {
    if (this.getLevel() >= 0) {
      this.colorlog(colors.red, items)
    }
  }

  warn(...items: any) {
    if (this.getLevel() >= 1) {
      this.colorlog(colors.yellow, items)
    }
  }

  info(...items: any) {
    if (this.getLevel() >= 2) {
      this.colorlog(colors.blue, items)
    }
  }

  log(level: number, ...items: any) {
    if (typeof level !== 'number') {
      throw new Error('level must be a number')
    }
    if (this.getLevel() >= level) {
      this.colorlog(colors.blue, items)
    }
  }

  getLevel() {
    if (typeof this.logLevel === 'function') {
      return this.logLevel()
    }
    if (typeof this.logLevel === 'number') {
      return this.logLevel
    }

    throw new Error('Unknown type for logLevel')
  }

  colorlog(color: Function, items: any) {

    const date = new Date()
    const hours = `00${date.getHours()}`.slice(-2)
    const minutes = `00${date.getMinutes()}`.slice(-2)
    const seconds = `00${date.getSeconds()}`.slice(-2)
    const time = colors.black(`[${hours}:${minutes}:${seconds}]`)

    console.log.apply(this, [time, color(this.prefix)].concat(items))
  }
}

// Global logger
Logger.app = new Logger('app')

export default Logger
