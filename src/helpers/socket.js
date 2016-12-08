/* @flow */
/* eslint no-console: 0 */

export type Action = {
  type: string,
  payload: Object,
}

export type Options = {
  debug?: boolean,
  reactNative?: boolean,
  server?: boolean,
}

const DISPATCH = '@@socket/DISPATCH'

// Watch events
export const watch = (callback: Function): Function => {
  return (socket, options: Options): void => {
    socket.on(DISPATCH, (action: Action) => {
      if (options.debug) console.log('👉 ', action)
      callback(action)
    })
  }
}

// Dispatch an event
export const dispatch = (...actions: Array<Action>): Function => {
  return (socket, options: Options): void => {
    actions.forEach((action) => {
      if (options.debug) console.log('👈 ', action)
      socket.emit(DISPATCH, action)
    })
  }
}

// Wrap socket.io
export const run = (worker: Function): Function => {
  return (io, options: Options): void => {
    // Return watch and dispatch helpers
    const start = (socket) => worker({
      watch: (callback) => {
        return watch(callback)(socket, options)
      },
      dispatch: (callback) => {
        return dispatch(callback)(socket, options)
      },
    })
    // Run for server
    if (options.server) {
      if (options.debug) console.log('✋ ', 'init')
      return io.on('connection', (socket) => start(socket))
    }
    // Run for browser
    return start(io)
  }
}
