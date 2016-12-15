/* @flow */

import request from 'request-promise'

import { Moods, MoodState } from '@base/mood'
import Manager from '@root/manager'
import Logger from '@helpers/logger'

const IP_URL = 'http://ip-api.com/json/'
const WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=651e10753244afccb45c140b1dac2ef1'

const sunLogger = new Logger('sun')

export default {
  name: 'weather',
  start: async (manager: Manager, logger: Logger) => {
    try {
      const callback = async function weatherLoop() {
        logger.info('Querying...')
        const geo = JSON.parse(await request(IP_URL))

        const parsedUrl = WEATHER_URL.replace('{lat}', geo.lat).replace('{lon}', geo.lon)
        const forecast = JSON.parse(await request(parsedUrl))

        // Sun
        const sunrise = forecast.sys.sunrise
        const sunset = forecast.sys.sunset
        const now = new Date().getTime() / 1000

        if (now > sunset) {
          // Late, go bed
          manager.addState('sun', new MoodState(30, 15 * 60, Moods.CALM))
          sunLogger.info('Sun has set')
        } else if (now < sunrise - (6 * 3600)) {
          // 6h before sunrise
          manager.addState('sun', new MoodState(40, 15 * 60, Moods.CALM))
          sunLogger.info('Really late')
        } else if (now > sunrise) {
          // 0 to 1 hour after sunrise
          if (now < sunrise + (60 * 1000)) {
            manager.addState('sun', new MoodState(30, 15 * 60, Moods.DYNAMIC))
            sunLogger.info('Fresh morning')
          }
        }

        // Weather
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
