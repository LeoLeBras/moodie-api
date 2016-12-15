/* @flow */

import hue from 'node-hue-api'
import Logger from '@helpers/logger'

export type Options = {
  logger: Logger,
  username: string,
  lights?: Array<number>,
  brightness: number,
}

const HueApi = hue.HueApi
const lightState = hue.lightState

const changeSaturation = (rgb: Array<number>, intensity: number) => {
  const average = rgb.reduce((p, c) => p + c, 0) / 3
  return rgb.map(x => x + ((average - x) * ((100 - intensity) / 100)))
            .map(Math.round)
            .map(x => (x < 0 ? 0 : x))
            .map(x => (x > 255 ? 255 : x))
}

export default async (addHandler: Function, options: Options): Promise<void> => {
  const logger = options.logger
  try {
    // Begin by searching for bridges
    logger.info('Searching bridges ... 🔥')

    const bridges = await new Promise((resolve) => {
      // Get via public url
      hue.nupnpSearch().then((data) => {
        logger.info('Resolved via public url')
        resolve(data)
      })

      // Get via pinging network
      hue.upnpSearch().then((data) => {
        logger.info('Resolved via pinging network')
        resolve(data)
      })
    })

    // Search ended
    if (bridges.length > 0) {
      logger.info('Bridges found:', JSON.stringify(bridges))

      // Use the first bridge
      const bridge = bridges[0]

      // Make API and light state
      const api = new HueApi(bridge.ipaddress, options.username)
      const state = lightState.create()

      // Make an array with lights
      let bridgeLights
      try {
        bridgeLights = (await api.lights()).lights.map(light => parseInt(light.id))
      } catch (error) {
        logger.error('Cannot retrieve lights, are you connected to the right router?', error)
        return
      }

      let lights = options.lights
        ? options.lights.filter(id => bridgeLights.includes(id))
        : bridgeLights

      logger.info(`Found lights: ${JSON.stringify(lights)}`)

      let interval = 0
      let lastBrightness = options.brightness
      let from
      let to

      // Add handler to send new colors
      addHandler('philips-hue', (rgb: ?Array<number>, brightness: ?number) => {
        // Log color
        logger.info(`Updating lights ${JSON.stringify(lights)}`)

        // Make lightstate
        let isOn
        state.reset()
        if (brightness === 0) {
          // Brightness = 0 : Turn off
          lastBrightness = 0
          state.off()
          isOn = false
        } else {
          isOn = true
          state.on().transitionTime(20)
          if (typeof brightness === 'number') {
            // Brightness = 1 - 100 : Update if
            lastBrightness = brightness
            state.brightness(brightness)
          }

          from = null
          to = null

          if (rgb) {
            // RGB is defined : Update it
            state.rgb(rgb[0], rgb[1], rgb[2])
            from = changeSaturation(rgb, 120)
            to = changeSaturation(rgb, 70)
          }
        }

        let step = 0

        const loop = () => {
          if (isOn && from && to) {
            step += 1
            if (step % 2) {
              state.rgb(from[0], from[1], from[2])
              state.brightness(lastBrightness > 95 ? 100 : lastBrightness + 5)
            } else {
              state.rgb(to[0], to[1], to[2])
              state.brightness(lastBrightness < 5 ? 0 : lastBrightness - 5)
            }
          }

          // Iterate over each light
          lights.forEach(async (id: number, index: number) => {
            // Ignore
            if (id <= 0) return
            try {
              // And apply new light state
              const result = await api.setLightState(id, state)
              if (result !== true) {
                logger.warn(`Cannot change light state for #${id}:`, result)
              }
            } catch (e) {
              // Remove light on error
              // const index = lights.indexOf(id)
              // if (index !== -1) lights = lights.splice(index, 1)
              lights[index] = 0
              logger.warn(`Removed light #${id}, due to ${e.message}`)
            }
          })

          lights = lights.filter(x => x > 0)
        }

        clearInterval(interval)
        interval = setInterval(loop, 2500)
        loop()

        // Return true while there are lights
        return lights.length > 0
      })
    } else if (options.debug) {
      logger.error('No bridges found!')
    }
  } catch (error) {
    logger.error('Exception thrown:', error)
  }
}
