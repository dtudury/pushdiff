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
  let index = 0
  watchFunction(() => {
    // debounce?
    const diff = new PushDiff()
    diff.nextIndex = pd.nextIndex
    const nsIndex = pd.toIndex(model.local, diff)
    const valueEntries = Object.entries(diff.valuesByIndex)
    diffs[index] = diff
    webSocket.send(
      JSON.stringify({
        index,
        nsIndex,
        values: Object.entries(diff.valuesByIndex)
      })
    )
    ++index
  })
  webSocket.onmessage = event => {
    try {
      const { index, nsIndex, mapping } = JSON.parse(event.data)
      const diff = diffs[index]
      const translation = new Map(mapping)
      const translatedDiff = PushDiff.translateDiff(translation, diff)
      pd = window.pd = PushDiff.mergeDiffs(pd, translatedDiff)
      model.shared = pd.fromIndex(nsIndex)
      console.log(JSON.parse(JSON.stringify(model.shared)))
    } catch (e) {
      console.error(event, event.data)
      throw e
    }
  }
  webSocket.onclose = event => {
    console.error('============= onclose', event)
  }
}
