import type { Ref } from 'vue'
import type { Timeline, Twexom } from './index.js'

export declare function useTwexom(callback: (scope: HTMLElement | null, twexom: Twexom) => void): Ref<HTMLElement | null>
export declare function useTwexomTimeline(factory: (scope: HTMLElement | null, twexom: Twexom) => Timeline): {
  scope: Ref<HTMLElement | null>
  timeline: Ref<Timeline | null>
}
export default useTwexom
