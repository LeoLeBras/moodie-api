/* @flow */

import request from 'request-promise'
import SpotifyWebApi from 'spotify-web-api-node'

import Manager from '@root/manager'
import Logger from '@helpers/logger'

const LASTFM_URL = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=jadefrh&api_key=a28957333267eac9f3f43e12b5744506&format=json'

const spotifyApi = new SpotifyWebApi({
  clientId: 'db6ec2aef6204a2ba74039e4cd11d3e4',
  clientSecret: 'abd4d181727e4b83a13542ec1a5aa7f5',
  redirectUri: 'http://localhost:3000/spotify/',
})

export default {
  name: 'musics',
  start: async (manager: Manager, logger: Logger) => {
    const callback = async function musicsLoop() {
      try {
        logger.log(4, 'Querying musics...')
        const tracks = JSON.parse(await request(LASTFM_URL))

        const lastTrack = tracks.recenttracks.track[0]
        if (!lastTrack['@attr'] || lastTrack['@attr'].nowplaying !== 'true') {
          logger.info('No music playing...')
          return
        }

        const songName = lastTrack.name
        const artist = lastTrack.artist['#text']
        const album = lastTrack.album['#text']

        await spotifyApi.clientCredentialsGrant()
          .then(data => spotifyApi.setAccessToken(data.body.access_token), err => logger.error('Cannot get token', err))

        const search = (await spotifyApi.searchTracks(`${songName} ${artist}`)).body
        const result = search.tracks.items[0]

        if (!result) {
          logger.warn(`No results for "${songName} - ${artist}"`)
          return
        }

        const slugify = text => text.toLowerCase().replace(/ \(.+\)$/, '').replace(/[^a-z0-9]+/g, '')

        if (album && slugify(result.album.name) !== slugify(album)) {
          logger.warn(`Different albums founds: "${result.album.name}" ≠ "${lastTrack.album['#text']}"`)
          logger.warn(`Slugs were: "${slugify(result.album.name)}" ≠ "${slugify(lastTrack.album['#text'])}"`)
          return
        }

        const analysis = (await spotifyApi.getAudioFeaturesForTrack(result.id)).body

        if (analysis.id) {
          logger.info(`Now listening to ${songName} ♫`)
          logger.log(5, 'Song analysis:', analysis)
          manager.receive(null, {
            type: '@@musics/TRACK_ANALYSIS',
            payload: analysis,
          })
        } else {
          logger.warn(`Analyse not found for ${result.id}`)
        }
      } catch (error) {
        logger.error(`Exception thrown: ${error.message}`)
      }
    }

    callback()
    setInterval(callback, 5 * 1000)
  },
}
