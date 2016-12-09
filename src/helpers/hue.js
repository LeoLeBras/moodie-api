/* @flow */
/* eslint no-console: 0 */


import hue from 'node-hue-api'

type Options = {
  debug: boolean,
}

export const run = async (options: Options): void => {
  try {
    if (options.debug) console.log('Search Hue bridge ... 🔥')
    const bridge = await hue.nupnpSearch()
    if (bridge.length > 0 && options.debug) console.log('Bridge found: ', bridge)
  } catch (error) {
    if (options.debug) console.log(error)
  }
}
