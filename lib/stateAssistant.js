import { PushDiff } from './pushdiff.js'

const STATE_MISMATCH = 'state mismatch'

export class StateAssistant {
  pd = new PushDiff()
  setState (state, lastIndex, diff = this.pd) {
    const thisIndex = diff.nextIndex - 1
    if (lastIndex != undefined && lastIndex !== thisIndex) {
      throw new Error(STATE_MISMATCH)
    }
    const pLast = thisIndex < 2 ? -1 : thisIndex
    const pState = this.pd.toIndex(state, diff)
    return this.pd.toIndex({ pLast, pState }, diff)
  }
  watchState ()
}
