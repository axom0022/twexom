import type { RefObject } from 'react'
import type { Tween, Timeline, Twexom } from './index.js'

export declare function useTwexom(callback: (scope: HTMLElement | null, twexom: Twexom) => void, dependencies?: unknown[]): RefObject<HTMLElement | null>
export declare function useTwexomTimeline(factory: (scope: HTMLElement | null, twexom: Twexom) => Timeline, dependencies?: unknown[]): {
  scope: RefObject<HTMLElement | null>
  timeline: RefObject<Timeline | null>
}
export default useTwexom
