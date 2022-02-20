import { createWriteStream, readFileSync } from 'fs'
import http from 'http'
import handler from 'serve-handler'
import { WebSocketServer } from 'ws'
import { PushDiff } from './lib/pushdiff.js'

const port = 3000
server.listen(port, () => {
  console.log(`Running at http://localhost:${port}`)

  let pd = new PushDiff()

  const logValueByIndex = offset => (value, index) =>
    console.log(`${(offset + index).toString().padStart(9, ' ')}: ${value}`)

  const historyPath = './temp.ndjson'
  try {
    const history = new PushDiff()
    history.valuesByIndex = new Array(2).concat(
      readFileSync(historyPath, 'utf8')
        .split(/\n/)
        .filter(Boolean)
    )
    pd = PushDiff.mergeDiffs(history)
    history.valuesByIndex.forEach(logValueByIndex(0))
    pd.nextIndex = history.valuesByIndex.length
    console.log('pd.nextIndex', pd.nextIndex)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  const history = createWriteStream(historyPath, { flags: 'a' })

  const server = http.createServer((request, response) => {
    return handler(request, response)
  })

  const wss = new WebSocketServer({ noServer: true })
  const connections = new Set()

  //keep alive?
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
      connections.add(ws)
      console.log(`connections: ${connections.size}`)
      ws.on('message', data => {
        try {
          let { id, index, values } = JSON.parse(data)
          const diff = new PushDiff()
          diff.valuesByIndex = values.reduce((acc, [key, value]) => {
            acc[key] = value
            return acc
          }, [])
          const mark = pd.nextIndex
          const translation = PushDiff.applyDiff(pd, diff)
          const newValuesByIndex = pd.valuesByIndex.slice(mark)
          newValuesByIndex.forEach(logValueByIndex(mark))
          history.write(newValuesByIndex.map(value => `${value}\n`).join(''))
          index = PushDiff.translate(index, translation)
          const mapping = [...translation]
          ws.send(JSON.stringify({ id, index, mapping }))
          console.log('pd.nextIndex', pd.nextIndex)
        } catch (error) {
          console.error(error)
        }
      })
      ws.on('close', event => {
        console.log('close', event)
        connections.delete(ws)
        console.log(`connections: ${connections.size}`)
      })
    })
  })
})
