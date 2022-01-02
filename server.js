import http from 'http'
import handler from 'serve-handler'
import { WebSocketServer } from 'ws'
import { PushDiff } from './lib/pushdiff.js'

const pd = new PushDiff()
pd.toIndex([1, 2, 3])

const server = http.createServer((request, response) => {
  return handler(request, response)
})

const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    ws.on('message', data => {
      try {
        const { index, values } = JSON.parse(data)
        const diff = new PushDiff()
        diff.valuesByIndex = values.reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, [])
        const translation = PushDiff.applyDiff(pd, diff)
        console.log(pd.valuesByIndex)
        console.log(translation)
        console.log(index)
        console.log(values)
        const arrayFromMap = [...translation]
        ws.send(JSON.stringify({ index, translation: [...translation] }))
        console.log(arrayFromMap)
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
