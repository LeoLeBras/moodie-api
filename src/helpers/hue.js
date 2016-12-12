/* @flow */

import hue from 'node-hue-api'
import Logger from '@helpers/logger'

export type Options = {
  logger: Logger,
  username: string,
  lights?: Array<number>,
}

const HueApi = hue.HueApi
const lightState = hue.lightState

export default async (addHandler: Function, options: Options): Promise<void> => {
  const logger = options.logger
  try {
    // Begin by searching for bridges
    logger.info('Searching bridges ... 🔥')
    const bridges = await hue.nupnpSearch()

    // Search ended
    if (bridges.length > 0) {
      logger.info('Bridges found:', JSON.stringify(bridges))

      // Use the first bridge
      const bridge = bridges[0]

      // Make API and light state
      const api = new HueApi(bridge.ipaddress, options.username)
      const state = lightState.create()

      // Make an array with lights
      const bridgeLights = (await api.lights()).lights.map(light => parseInt(light.id))
      const lights = options.lights
        ? options.lights.filter(id => bridgeLights.includes(id))
        : bridgeLights

      // Add handler to send new colors
      addHandler('philips-hue', (rgb: Array<number>, brightness: number) => {
        logger.info(`Sending rgb: ${JSON.stringify(rgb)}, brightness: ${brightness}`)

        // Make lightstate
        state.reset()
        if (brightness) state.on().rgb(rgb[0], rgb[1], rgb[2]).brightness(brightness)
        else state.off()

        // Iterate over each light
        lights.forEach(async (id: number) => {
          try {
            // And apply new light state
            const result = await api.setLightState(id, state)
            if (result !== true) {
              logger.warn(`Cannot change light state for #${id}:`, result)
            }
          } catch (e) {
            // Remove light on error
            const index = lights.indexOf(id)
            if (index !== -1) lights.splice(index, 1)
            logger.warn(`Removed light #${id}, due to ${e.message}`)
          }
        })

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
