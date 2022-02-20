import { h, proxy, render, watchFunction } from './horseless.0.5.4.min.esm.js'
import { PushDiff } from '../lib/pushdiff.js'
import { getByPath, setByPath } from '../lib/jsonPointer.js'
import { StateAssistant } from '../lib/StateAssistant.js'

const clone = o => JSON.parse(JSON.stringify(o))

const model = (window.model = proxy({
  shared: null,
  local: null
}))

let sa = (window.sa = new StateAssistant())
window.pd = sa.pd

const webSocket = new WebSocket('ws://localhost:3000')

const diffs = {}

webSocket.onopen = event => {
  let id = 0
  watchFunction(() => {
    // debounce?
    const diff = new PushDiff()
    diff.nextIndex = sa.pd.nextIndex
    const index = sa.pd.toIndex(model.local, diff)
    const valueEntries = Object.entries(diff.valuesByIndex)
    diffs[id] = diff
    webSocket.send(
      JSON.stringify({
        id,
        index,
        values: Object.entries(diff.valuesByIndex)
      })
    )
    ++id
  })
  webSocket.onmessage = event => {
    try {
      const { id, index, mapping } = JSON.parse(event.data)
      const diff = diffs[id]
      const translation = new Map(mapping)
      const translatedDiff = PushDiff.translateDiff(translation, diff)
      sa.pd = window.pd = PushDiff.mergeDiffs(sa.pd, translatedDiff)
      model.shared = sa.pd.fromIndex(index)
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
