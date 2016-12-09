/* @flow */
/* eslint no-console: 0 */


import hue from 'node-hue-api'

type Options = {
  debug: boolean,
  username: string,
}

const HueApi = hue.HueApi
const lightState = hue.lightState

export const run = async (options: Options): Promise<void> => {
  try {
    if (options.debug) console.log('Search Hue bridge ... 🔥')
    const bridges = await hue.nupnpSearch()
    if (bridges.length > 0) {
      if (options.debug) console.log('Bridges found: ', bridges)

      // Use the first one
      const bridge = bridges[0]
      const api = new HueApi(bridge.ipaddress, options.username)
      const state = lightState.create()

      const rand = () => Math.floor((Math.random() * 255))

      setInterval(async () => {
        state.on().rgb(rand(), rand(), rand()).brightness(15)
        console.log(await api.setLightState(1, state))
      }, 2000)
    }
  } catch (error) {
    if (options.debug) console.log(error)
  }
}
