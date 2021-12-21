import { h, proxy, render } from './horseless.0.5.3.min.esm.js'
import { PushDiff } from '../lib/pushdiff.js'

const webSocket = new WebSocket('ws://localhost:3000')

webSocket.onopen = event => {
  console.log(event)
  webSocket.send('hello there')
}
webSocket.onmessage = event => {
  console.log(event)
  console.log(event.data)
}
