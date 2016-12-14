/* @flow */

import readline from 'readline'
import colors from 'colors/safe'
import { Moods, MoodState, MoodColor } from '@base/mood'
import Logger, { makeCliColor } from '@helpers/logger'
import Manager from '@root/manager'

let lastCommand = null

export default function (manager: Manager, config: Object) {
  const cliLogger = new Logger('cli', 9)
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  }).on('line', (cmd) => {
    let text = cmd.trim()
    if (text.length === 0) {
      if (lastCommand) {
        text = lastCommand
        console.log(colors.black(`$ ${lastCommand}`))
      } else {
        cliLogger.error('No last command to resend')
        return
      }
    }

    lastCommand = text
    const args = text.split(' ')

    // Change logging level
    if (args[0] === 'log') {
      if (args.length === 1) {
        Logger.setGlobalLevel(config.loglevel)
        cliLogger.info(`Logging level set to default (${config.loglevel})`)
      } else {
        const newLevel = args.length === 2 ? parseInt(args[1]) : config.logLevel
        if (newLevel >= -1 && newLevel < 10) {
          Logger.setGlobalLevel(newLevel)
          cliLogger.info(`Logging level set to ${newLevel}`)
        } else {
          cliLogger.error(`Incorrect number: ${args[1]}`)
        }
      }
      return
    }

    // Change light color
    if (args[0] === 'rgb') {
      if (args.length < 4) {
        cliLogger.error('Missing args (3 minimum)')
      } else {
        // Get values from args
        const rgb = [args[1], args[2], args[3]].map(x => parseInt(x))
        const seconds = args.length >= 5 ? parseInt(args[4]) : 30

        // Test valid number
        if (rgb.some(isNaN)) {
          cliLogger.error('Incorrect number')
        } else {
          // Then send color
          cliLogger.info('Dispatching color...')
          manager.addState('override', new MoodState(1000, seconds, new MoodColor('rgb', rgb)))
        }
      }
      return
    }

    // Brightness
    if (['brightness', 'bright', 'b'].includes(args[0])) {
      if (args.length >= 2) {
        const brightness = parseInt(args[1])
        if (!isNaN(brightness)) {
          manager.setBrightness(brightness)
          cliLogger.info(`Brightness set to ${brightness}`)
          return
        }
      }
      cliLogger.error('Incorrect or missing argument')
      return
    }

    // Current color
    if (['current', 'c'].includes(args[0])) {
      const color = manager.currentColor
      const brightness = manager.currentBrightness
      makeCliColor(color[0], color[1], color[2], (format) => {
        cliLogger.info(`Color: ${format}, brightness: ${brightness}%`)
      })
      return
    }

    // Switch off the light
    if (args[0] === 'off') {
      cliLogger.info('Switching off...')
      manager.setBrightness(0)
      const seconds = args.length >= 2 ? parseInt(args[1]) : 30
      manager.addState('override', new MoodState(1000, seconds, Moods.WHITE))
      return
    }

    // Minimum light
    if (args[0] === 'min') {
      cliLogger.info('Minimum light...')
      manager.setBrightness(1)
      const seconds = args.length >= 2 ? parseInt(args[1]) : 30
      manager.addState('override', new MoodState(1000, seconds, Moods.WHITE))
      return
    }

    // Maximum light
    if (args[0] === 'max') {
      cliLogger.info('Maximum light...')
      manager.setBrightness(100)
      const seconds = args.length >= 2 ? parseInt(args[1]) : 30
      manager.addState('override', new MoodState(1000, seconds, Moods.WHITE))
      return
    }

    // Random
    if (args[0] === 'rand') {
      cliLogger.info('Random color...')
      const seconds = args.length >= 2 ? parseInt(args[1]) : 30
      const rand = () => Math.floor(Math.random() * 255)
      const rgb = [rand(), rand(), rand()]
      manager.addState('override', new MoodState(1000, seconds, new MoodColor('rand', rgb)))
      return
    }

    // Select a mood color
    if (args[0] === 'mood') {
      if (args.length >= 2) {
        const mood = Moods[args[1].toUpperCase()]
        if (mood) {
          cliLogger.info(`Mood ${mood.getName()}...`)
          const seconds = args.length >= 3 ? parseInt(args[2]) : 30
          manager.addState('override', new MoodState(1000, seconds, mood))
        } else {
          cliLogger.error(`Unknown mood: ${args[1].toUpperCase()}`)
        }
      } else {
        cliLogger.error(`Select a mood in ${JSON.stringify(Object.keys(Moods))}`)
      }
      return
    }

    cliLogger.error(`Unknown command: ${args[0]}`)
  })
}
