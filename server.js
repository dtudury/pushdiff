import http from 'http'
import handler from 'serve-handler'
import { WebSocketServer } from 'ws'
import { PushDiff } from './lib/pushdiff.js'

const pd = new PushDiff()

const server = http.createServer((request, response) => {
  return handler(request, response)
})

const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    ws.on('message', data => {
      try {
        const {index, values} = JSON.parse(data)
        console.log(index)
        console.log(values)
      } catch (error) {
        console.error(error)
      }
    })
  })
})

const port = 3000
server.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})

console.log(pd)
