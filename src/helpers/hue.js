/* @flow */

import hue from 'node-hue-api'

type Options = {
  debug: boolean,
  username: string,
  lights?: Array<number>,
}

const HueApi = hue.HueApi
const lightState = hue.lightState

export const run = async (options: Options): Promise<void> => {
  try {
    // Begin by searching for bridges
    if (options.debug) console.log('Search Hue bridge ... 🔥')
    const bridges = await hue.nupnpSearch()

    // Search ended
    if (bridges.length > 0) {
      if (options.debug) console.log('Bridges found: ', bridges)

      // Use the first one
      const bridge = bridges[0]

      // Make API and light state
      const api = new HueApi(bridge.ipaddress, options.username)
      const state = lightState.create()

      // Make an array with lights
      const bridgeLights = (await api.lights()).lights.map(light => parseInt(light.id))
      const lights = options.lights
        ? options.lights.filter(id => bridgeLights.includes(id))
        : bridgeLights

      // Random int from range 0 - 255
      const rand = () => Math.floor((Math.random() * 255))

      // And start the loop
      const loop = setInterval(async () => {
        // lights array is empty
        if (lights.length === 0) {
          clearInterval(loop)
          console.error('lights is empty, stopping loop...')
        }

        // Define light state
        state.on().rgb(rand(), rand(), rand()).brightness(1)

        // Iterate over each light
        lights.forEach(async (id) => {
          try {
            // And apply new light state
            const result = await api.setLightState(id, state)
            if (result !== true && options.debug) {
              console.error('Cannot change light state', result)
            }
          } catch (e) {
            // Remove light on error
            const index = lights.indexOf(id)
            if (index !== -1) lights.splice(index, 1)
            if (options.debug) console.warn(`Removed light #${id}, due to ${e.message}`)
          }
        })
      }, 2000)
    } else if (options.debug) {
      console.error('No bridges found')
    }
  } catch (error) {
    if (options.debug) console.error(error)
  }
}
