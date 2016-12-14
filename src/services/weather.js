/* @flow */

import request from 'request-promise'

import Manager from '@root/manager'
import Logger from '@helpers/logger'

const IP_URL = 'http://ip-api.com/json/'
const WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=651e10753244afccb45c140b1dac2ef1'

export default {
  name: 'weather',
  start: async (manager: Manager, logger: Logger) => {
    try {
      const callback = async function weatherLoop() {
        logger.info('Querying...')
        const geo = JSON.parse(await request(IP_URL))

        const parsedUrl = WEATHER_URL.replace('{lat}', geo.lat).replace('{lon}', geo.lon)
        const forecast = JSON.parse(await request(parsedUrl))
        const description = forecast.weather[0].description
        const conditions = forecast.weather[0].id

        logger.info(`Conditions: ${conditions}, ${description}`)

        if (conditions >= 700) {
          manager.receive(null, {
            type: '@@weather/CLEAR',
            payload: { conditions },
          })
        } else if (conditions >= 300) {
          manager.receive(null, {
            type: '@@weather/RAIN',
            payload: { conditions },
          })
        } else {
          manager.receive(null, {
            type: '@@weather/STORM',
            payload: { conditions },
          })
        }
      }

      callback()
      setInterval(callback, 10 * 60 * 1000)
    } catch (error) {
      logger.error('Exception thrown:', error)
    }
  },
}
