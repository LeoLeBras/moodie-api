/* @flow */

import colors from 'colors/safe'
import cp from 'child_process'

export const makeCliColor = (r, g, b, cb) => {
  return new Promise((resolve) => {
    return cp.exec(`printf "|\x1b[48;2;${r};${g};${b}m   \x1b[0m|"`, (err, stdout) => {
      return resolve(stdout)
    })
  }).then(cb)
}

let globalLogLevel = 0

class Logger {

  static setGlobalLevel(level) {
    globalLogLevel = level
  }

  static getGlobalLevel() {
    return globalLogLevel
  }

  constructor(prefix, logLevel) {
    this.prefix = `[${prefix}]`
    this.logLevel = typeof logLevel === 'undefined'
      ? Logger.getGlobalLevel
      : logLevel
  }

  error(...items) {
    if (this.getLevel() >= 0) {
      this.colorlog(colors.red, items)
    }
  }

  warn(...items) {
    if (this.getLevel() >= 1) {
      this.colorlog(colors.yellow, items)
    }
  }

  info(...items) {
    if (this.getLevel() >= 2) {
      this.colorlog(colors.blue, items)
    }
  }

  log(level, ...items) {
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
    return this.logLevel
  }

  colorlog(color, items) {
    console.log.apply(this, [color(this.prefix)].concat(items))
  }
}

// Global logger
Logger.app = new Logger('app')

export default Logger
