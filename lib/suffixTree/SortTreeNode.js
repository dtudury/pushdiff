
export class SortTreeNode {
  lower = null
  higher = null
  constructor(index) {
    this.index = index
  }
  walk = (comparator) => {
    const {direction, comparison} = comparator(this.index)
    if (direction < 0) {
      if (this.lower) return this.lower.walk(comparator)
    } else if (direction > 0) {
      if (this.higher) return this.higher.walk(comparator)
    }
    return { node: this, comparison }
  }
}