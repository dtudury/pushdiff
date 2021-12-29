import { h, proxy, render } from './horseless.0.5.3.min.esm.js'
import { PushDiff } from '../lib/pushdiff.js'
import { getByPath, setByPath } from '../lib/jsonPointer.js'

const webSocket = new WebSocket('ws://localhost:3000')

webSocket.onopen = event => {
  console.log(event)
  webSocket.send('hello there')
}
webSocket.onmessage = event => {
  console.log(event)
  console.log(event.data)
}

const pd1 = (window.pd1 = new PushDiff())
console.log(pd1)

const m = {
  b: [1, 2],
  a: {
    d: 'asdf',
    c: true
  },
  e: null
}

const pd2 = (window.pd2 = new PushDiff())

const i11 = pd1.valuesByIndex.length
const i12 = pd1.toIndex(m)

pd2.toIndex([1, 2, 3])
const changes = pd1.valuesByIndex.slice(i11, i12 + 1)
console.log(i11, changes)
const rebaseMap = pd2.rebase(i11, changes)
console.log(rebaseMap)

console.log('pd1', i12, pd1.fromIndex(i12))
console.log('pd2', rebaseMap.get(i12), pd2.fromIndex(rebaseMap.get(i12)))
pd1.applyPatch(i11, changes, rebaseMap)
// console.log(rebaseMap.get(i12), pd2.fromIndex(rebaseMap.get(i12)))

/*
pd.replace('/a/b/test', m, 'initial commit')
console.log(JSON.stringify(pd.namespace, null, ' . '))
setByPath(m, '/a/f/~', { g: 100, h: 200, i: 300 })
pd.replace('/b/2', 'outis')
console.log(JSON.stringify(pd.namespace, null, ' . '))
pd.replace('/b/2', 'outis')
console.log(JSON.stringify(pd.namespace, null, ' . '))
setByPath(m, '/a/f/~', { $ref: '/b/1' })
pd.replace('/a/b/test', m, 'commit #: the second')
pd.replace('/b/2', 'outis')
console.log(JSON.stringify(pd.namespace, null, ' . '))
*/
/*
setByPath(m, '/a/f/~', { $ref: '/b/1' })
pd.replace('/a/b/test', m, 'commit #: the second')
console.log(JSON.stringify(pd.namespace, null, ' . '))
console.log(pd.dereference('/a/b/test').value)
*/
