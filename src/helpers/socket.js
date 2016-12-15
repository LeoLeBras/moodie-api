/* @flow */

import Logger from '@helpers/logger'
import colors from 'colors/safe'

export type Action = {
  type: string,
  payload: Object,
}

export type Options = {
  logger: Logger,
  reactNative?: boolean,
  server?: boolean,
}

const DISPATCH = '@@socket/DISPATCH'

// Watch events
export const watch = (callback: Function): Function => {
  // Return a watcher using callback
  return (socket, options: Options): void => {
    socket.on(DISPATCH, (action: Action) => {
      const addr = socket.handshake.address.split(':').pop()
      options.logger.log(3, colors.green(`[${addr}]`), '👉 ', action)
      callback(action)
    })
  }
}

// Dispatch an event
export const dispatch = (actions: Array<Action>): Function => {
  // Return a dispatcher that iterate over actions
  return (socket, options: Options): void => {
    actions.forEach((action) => {
      const addr = socket.handshake.address.split(':').pop()
      options.logger.log(3, colors.green(`[${addr}]`), '👈 ', action)
      socket.emit(DISPATCH, action)
    })
  }
}

// Wrap socket.io
export default (worker: Function): Function => {
  return (io, options: Options): void => {
    // Return watch and dispatch helpers
    const start = socket => worker({
      watch: callback => watch(callback)(socket, options),
      dispatch: (...actions) => dispatch(actions)(socket, options),
    })
    // Run server-side
    if (options.server) {
      options.logger.info('✋ ', 'init')
      return io.on('connection', (socket) => {
        const addr = socket.handshake.address.split(':').pop()
        options.logger.info(colors.green(`[${addr}]`), '👌 ', 'new connection')
        start(socket)
      })
    }
    // Run client-side
    return start(io)
  }
}
