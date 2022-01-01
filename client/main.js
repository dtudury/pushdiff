import { h, proxy, render, watchFunction } from './horseless.0.5.4.min.esm.js'
import { PushDiff } from '../lib/pushdiff.js'
import { getByPath, setByPath } from '../lib/jsonPointer.js'

const clone = o => JSON.parse(JSON.stringify(o))

const model = (window.model = proxy({
  shared: null,
  local: null
}))

const pd = new PushDiff()

const webSocket = new WebSocket('ws://localhost:3000')

webSocket.onopen = event => {
  console.log(event)
  let index = 0
  watchFunction(() => {
    const diff = new PushDiff()
    pd.toIndex(model, diff)
    const valueEntries = Object.entries(diff.valuesByIndex)
    webSocket.send(
      JSON.stringify({ index, values: Object.entries(diff.valuesByIndex) })
    )
    ++index
  })
  webSocket.onmessage = event => {
    console.log(event)
    console.log(event.data)
  }
}

/*
// this is almost a test...
const replica = (window.replica = new PushDiff())
replica.toIndex(['a', 'b', 'asdf'])
console.log('replica.valuesByIndex', replica.valuesByIndex)
const replicaDiff = (window.replicaDiff = new PushDiff())

const m = {
  b: [1, 2],
  a: {
    d: 'asdf',
    c: true
  },
  e: null
}

replica.toIndex(m, replicaDiff) // save changes to replicaDiff instead of applying directly
console.log('replicaDiff.valuesByIndex', replicaDiff.valuesByIndex)

const primary = (window.primary = new PushDiff())
primary.toIndex(['a', 'b', 'asdf'])
primary.toIndex([1, 2, 3]) // to get primary ahead of replica
console.log('primary.valuesByIndex', primary.valuesByIndex)

const translation = PushDiff.applyDiff(primary, replicaDiff) // update primary with saved changes
console.log('primary.valuesByIndex', primary.valuesByIndex)
console.log('translation', translation)
const translatedReplicaDiff = (window.translatedReplicaDiff = PushDiff.translateDiff(
  translation,
  replicaDiff
))
console.log(
  'translatedReplicaDiff.valuesByIndex',
  translatedReplicaDiff.valuesByIndex
)

const mergedDiff = (window.mergedDiff = PushDiff.mergeDiffs(
  replica,
  translatedReplicaDiff
))
console.log('mergedDiff.valuesByIndex', mergedDiff.valuesByIndex)
PushDiff.applyDiff(replica, translatedReplicaDiff) // this *seems* like it should work but re-indexes the diff
console.log('replica.valuesByIndex', replica.valuesByIndex) // too short! (should have gaps)

window.PushDiff = PushDiff
*/
