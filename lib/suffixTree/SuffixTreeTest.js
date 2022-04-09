import { ABTree, SuffixTree } from './SuffixTree.js'


const st = new SuffixTree()
st.insert('asdf')
st.insert('abcdefg')

// st.print()

const abTree = new ABTree()
const enc = new TextEncoder()
abTree.insert(new Uint8Array(enc.encode('abracadabra')))