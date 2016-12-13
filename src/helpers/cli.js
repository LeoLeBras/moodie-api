/* @flow */

import readline from 'readline'
import { Moods } from '@base/mood'
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
        const brightness = args.length === 5 ? parseInt(args[4]) : undefined

        // Test valid number
        if (rgb.concat(brightness).some(isNaN)) {
          cliLogger.error('Incorrect number')
        } else {
          // Then send color
          cliLogger.info('Dispatching color...')
          manager.send(rgb, brightness)
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
          manager.send(null, brightness)
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
      manager.send([255, 255, 255], 0)
      return
    }

    // Minimum light
    if (args[0] === 'min') {
      cliLogger.info('Minimum light...')
      manager.send([255, 255, 255], 1)
      return
    }

    // Maximum light
    if (args[0] === 'max') {
      cliLogger.info('Maximum light...')
      manager.send([255, 255, 255], 100)
      return
    }

    // Random
    if (args[0] === 'rand') {
      cliLogger.info('Random color...')
      const brightness = args.length >= 3 ? parseInt(args[2]) : undefined
      const rand = () => Math.floor(Math.random() * 255)
      manager.send([rand(), rand(), rand()], brightness)
      return
    }

    // Select a mood color
    if (args[0] === 'mood') {
      if (args.length >= 2) {
        const mood = Moods[args[1].toUpperCase()]
        if (mood) {
          const brightness = args.length >= 3 ? parseInt(args[2]) : undefined
          cliLogger.info(`Mood ${mood.getName()}...`)
          manager.send(mood.getColor(), brightness)
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
