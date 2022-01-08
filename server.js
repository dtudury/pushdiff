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
        let { index, nsIndex, values } = JSON.parse(data)
        const diff = new PushDiff()
        diff.valuesByIndex = values.reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, [])
        const translation = PushDiff.applyDiff(pd, diff)
        nsIndex = PushDiff.translate(nsIndex, translation)
        console.log(pd.valuesByIndex)
        console.log('translated nsIndex', nsIndex)
        console.log(JSON.parse(JSON.stringify(pd.fromIndex(nsIndex))))
        const mapping = [...translation]
        ws.send(JSON.stringify({ index, nsIndex, mapping }))
      } catch (error) {
        console.error(error)
      }
    })
    ws.on('close', event => {
      console.log('close', event)
    })
  })
})

const port = 3000
server.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)
})
