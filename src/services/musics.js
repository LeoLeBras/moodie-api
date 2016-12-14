/* @flow */

import request from 'request-promise'

import Manager from '@root/manager'
import Logger from '@helpers/logger'

const LASTFM_URL = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=jadefrh&api_key=a28957333267eac9f3f43e12b5744506&format=json'
const TRACK_SEARCH_URL = 'https://api.spotify.com/v1/search?type=track&q='
const TRACK_ANALYSIS_URL = 'https://api.spotify.com/v1/audio-features/'

export default {
  name: 'musics',
  start: async (manager: Manager, logger: Logger) => {
    const callback = async function musicsLoop() {
      try {
        logger.info('Querying...')
        const tracks = JSON.parse(await request(LASTFM_URL))

        const lastTrack = tracks.recenttracks.track[0]
        if (!lastTrack['@attr'] || lastTrack['@attr'].nowplaying !== 'true') {
          logger.info('No music playing...')
          return
        }

        const songName = lastTrack.name
        const artist = lastTrack.artist['#text']
        const query = encodeURIComponent(`${songName} ${artist}`)

        const results = JSON.parse(await request(`${TRACK_SEARCH_URL}${query}`))
        const result = results.tracks.items[0]

        const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '')

        if (slugify(result.album.name) !== slugify(lastTrack.album['#text'])) {
          logger.warn(`Different albums founds: "${result.album.name}" ≠ "${lastTrack.album['#text']}"`)
          return
        }

        const analysis = JSON.parse(await request({
          url: `${TRACK_ANALYSIS_URL}${result.id}`,
          headers: {
            Authorization: 'Bearer BQARZFGBfiiKjIhfM16mlz2kUG_l6aL1NanyYP_XB1m6nfeSZ0eixWOjdhi4j8ElWxMkVPfkwtmwruKRIRawHqShsED_34FI4Kp0JIfanf8aow1u682eFtcQ_mJAA91sJ0HJ210tHMk',
            Accept: 'application/json',
          },
        }))

        if (analysis.id) {
          logger.info(`Now listening to ${songName} ♫`)
          manager.receive(null, {
            type: '@@musics/TRACK_ANALYSIS',
            payload: { analysis },
          })
        } else {
          logger.warn(`Analyse not found for ${result.id}`)
        }
      } catch (error) {
        logger.error('Exception thrown:', error)
      }
    }

    callback()
    setInterval(callback, 60 * 1000)
  },
}
