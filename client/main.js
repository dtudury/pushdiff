import { h, proxy, render, watchFunction } from './horseless.0.5.4.min.esm.js'
import { PushDiff } from '../lib/pushdiff.js'
import { getByPath, setByPath } from '../lib/jsonPointer.js'

const clone = o => JSON.parse(JSON.stringify(o))

const model = (window.model = proxy({
  shared: null,
  local: null
}))

let pd = (window.pd = new PushDiff())

const webSocket = new WebSocket('ws://localhost:3000')

const diffs = {}

webSocket.onopen = event => {
  console.log(event)
  let index = 0
  watchFunction(() => {
    const diff = new PushDiff()
    diff.nextIndex = pd.nextIndex
    pd.toIndex(model.local, diff)
    const valueEntries = Object.entries(diff.valuesByIndex)
    console.log(diff)
    diffs[index] = diff
    webSocket.send(
      JSON.stringify({ index, values: Object.entries(diff.valuesByIndex) })
    )
    ++index
  })
  webSocket.onmessage = event => {
    try {
      const { index, translation } = JSON.parse(event.data)
      console.log(index, translation)
      const diff = diffs[index]
      console.log(diff)
      console.log(new Map(translation))
      const translatedDiff = PushDiff.translateDiff(new Map(translation), diff)
      console.log(translatedDiff)
      pd = window.pd = PushDiff.mergeDiffs(pd, translatedDiff)
    } catch (e) {
      console.log(event, event.data)
      throw e
    }
  }
  webSocket.onclose = event => {
    console.error('============= onclose', event)
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
