const pathToSegments = path =>
  path.split(/\//).map(segment => {
    if (segment === '~') return -1
    if (segment.match(/^(?:0|[1-9]\d*)$/)) return Number(segment)
    return segment.replace(/~1/g, '/').replace(/~0/g, '~')
  })

export const getByPath = (target, segments) => {
  if (!segments.length) return target
  if (!Array.isArray(segments)) segments = pathToSegments(segments)
  const [segment, ...remaining] = segments
  if (segment === '') return getByPath(target, remaining)
  if (segment === -1)
    throw new Error(
      `can't get "~" (it's the element in an array after the last one)`
    )
  if (Array.isArray(target) && (typeof segment !== 'number' || segment < 0))
    throw new Error(`can only access arrays with unsigned ints`)
  return getByPath(target && target[segment], remaining)
}

export const setByPath = (target, segments, value) => {
  if (!segments.length) return value
  if (!Array.isArray(segments)) segments = pathToSegments(segments)
  let [segment, ...remaining] = segments
  if (segment === '') return setByPath(target, remaining, value)
  if (target === undefined) target = typeof segment === 'number' ? [] : {}
  if (Array.isArray(target)) {
    segment = segment === -1 ? target.length : segment
    if (typeof segment !== 'number')
      throw new Error(`can only access arrays with unsigned ints`)
  }
  target[segment] = setByPath(target && target[segment], remaining, value)
  return target
}
