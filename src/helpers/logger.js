
import colors from 'colors/safe'

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
