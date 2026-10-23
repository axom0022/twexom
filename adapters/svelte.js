import engine from '../src/twexom.js'

const create = (node, parameters) => engine.context(() => {
  if (typeof parameters === 'function') parameters(node, engine)
  else if (parameters && typeof parameters.create === 'function') parameters.create(node, engine)
  else if (parameters && typeof parameters === 'object') engine.to(node, { ...(parameters.vars || parameters) })
})

export function twexom(node, parameters = {}) {
  let current = parameters
  let context = create(node, current)
  return {
    update(next) {
      if (next === current) return
      context.revert()
      current = next
      context = create(node, current)
    },
    destroy() {
      context.revert()
    }
  }
}

export const twexomAction = twexom
export default twexom
