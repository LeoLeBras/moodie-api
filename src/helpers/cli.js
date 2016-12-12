
import readline from 'readline'
import { Moods } from '@base/mood'
import Logger from '@helpers/logger'

export default function (manager, config) {
  const cliLogger = new Logger('cli', 9)
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  }).on('line', (cmd) => {
    const args = cmd.trim().split(' ')

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
        const brightness = args.length === 5 ? parseInt(args[4]) : 100

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
          return
        }
      }
      cliLogger.error('Incorrect or missing argument')
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
          manager.send(mood.getColor(), brightness)
        } else {
          cliLogger.error(`Unknown mood: ${args[1].toUpperCase()}`)
        }
      } else {
        cliLogger.error('Missing args (2 minimum')
      }
      return
    }

    cliLogger.error(`Unknown command: ${args[0]}`)
  })
}
