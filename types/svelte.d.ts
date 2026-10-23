import type { TweenVars, Twexom } from './index.js'

export type TwexomActionParameters = TweenVars | ((node: HTMLElement, twexom: Twexom) => void) | {
  vars?: TweenVars
  create?: (node: HTMLElement, twexom: Twexom) => void
}

export declare function twexom(node: HTMLElement, parameters?: TwexomActionParameters): {
  update(parameters: TwexomActionParameters): void
  destroy(): void
}
export declare const twexomAction: typeof twexom
export default twexom
