
const $ = jQuery // eslint-disable-line
const socket = io('http://localhost:3000') // eslint-disable-line

const CHANNEL = '@@socket/DISPATCH'

socket.on('connect', () => {
  console.log('Connected!')
})

socket.on('disconnect', () => {
  console.warn('Connection lost! Reloading in 3 seconds')
  setTimeout(() => {
    location.reload()
  }, 3000)
})

socket.on(CHANNEL, (data) => {
  console.log('>>> Received data:', data)
})

const actions = new Map()

$('[data-action]').on('click', function callback(e) {
  e.preventDefault()
  const name = $(this).data('action')
  const action = actions.get(name)
  if (action) {
    const packet = action()
    socket.emit(CHANNEL, packet)
    console.log('<<< Sending data:', packet)
  }
})

actions.set('wake', () => ({
  forward: {
    type: '@@healthkit/WAIT_AWAKENING',
    payload: {},
  },
}))

actions.set('sleep', () => ({
  type: '@@user/GO_TO_SLEEP',
  payload: {},
}))

actions.set('activity', () => ({
  type: '@@healthkit/DO_ACTIVITY',
  payload: {},
}))

actions.set('on', () => ({
  type: '@@hue/TURN_ON',
  payload: {},
}))

actions.set('off', () => ({
  type: '@@hue/TURN_OFF',
  payload: {},
}))

actions.set('clear', () => ({
  type: '@@weather/CLEAR',
  payload: { conditions: 700 },
}))

actions.set('rain', () => ({
  type: '@@weather/RAIN',
  payload: { conditions: 300 },
}))

actions.set('storm', () => ({
  type: '@@weather/STORM',
  payload: { conditions: 200 },
}))

actions.set('home', () => ({
  forward: {
    type: '@@home/COME_BACK_HOME',
    payload: {},
  },
}))
