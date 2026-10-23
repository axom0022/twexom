export type Target = string | Element | object | ArrayLike<Element | object> | null | undefined
export type Ease = string | ((progress: number) => number)
export type Value = number | string | ((index: number, target: any, targets: any[]) => number | string)
export type PropertyValue = Value | {
  value: Value
  ease?: Ease
  snap?: number | number[] | ((value: number) => number) | { increment?: number; step?: number }
  modifier?: (value: number, target: any) => number
  autoRound?: boolean
}

export interface TweenVars {
  [property: string]: any
  duration?: number
  delay?: number
  ease?: Ease
  repeat?: number
  repeatDelay?: number
  repeatRefresh?: boolean
  yoyo?: boolean
  yoyoEase?: Ease
  stagger?: number | { each?: number; amount?: number; from?: string | number; grid?: [number, number] | 'auto'; axis?: string; ease?: Ease }
  paused?: boolean
  overwrite?: boolean | 'auto'
  timeScale?: number
  immediateRender?: boolean
  keyframes?: Array<TweenVars> | Record<string, TweenVars>
  modifiers?: Record<string, (value: number, target: any) => number>
  scrollTrigger?: ScrollVars
  onStart?: (animation: Animation) => void
  onUpdate?: (animation: Animation) => void
  onRepeat?: (animation: Animation) => void
  onComplete?: (animation: Animation) => void
  onReverseComplete?: (animation: Animation) => void
  onInterrupt?: (animation: Animation) => void
}

export interface ScrollVars {
  trigger?: Target
  scroller?: Target
  scrollerProxy?: object
  start?: string | number
  end?: string | number
  scrub?: boolean | number
  animation?: Animation
  pin?: boolean | Target
  pinSpacing?: boolean
  snap?: number | number[] | 'labels' | { snapTo?: number | number[] | 'labels' | ((progress: number) => number); duration?: number; delay?: number; ease?: Ease }
  horizontal?: boolean
  once?: boolean
  reverse?: boolean
  toggleActions?: string
  toggleClass?: string
  invalidateOnRefresh?: boolean
  containerAnimation?: Animation
  onUpdate?: (scene: ScrollScene) => void
  onEnter?: (scene: ScrollScene) => void
  onLeave?: (scene: ScrollScene) => void
  onEnterBack?: (scene: ScrollScene) => void
  onLeaveBack?: (scene: ScrollScene) => void
  onToggle?: (scene: ScrollScene) => void
  onRefresh?: (scene: ScrollScene) => void
}

export class Animation {
  readonly vars: TweenVars
  readonly parent: Timeline | null
  readonly id: string
  play(): this
  pause(): this
  resume(): this
  reverse(): this
  restart(): this
  seek(time: number, suppressEvents?: boolean): this
  progress(): number
  progress(value: number): this
  totalProgress(): number
  totalProgress(value: number): this
  time(): number
  time(value: number): this
  duration(): number
  duration(value: number): this
  totalDuration(): number
  timeScale(): number
  timeScale(value: number): this
  kill(): this
  invalidate(): this
  isActive(): boolean
}

export class Tween extends Animation {
  readonly targets: any[]
  readonly original: TweenVars
  render(time: number, suppressEvents?: boolean): this
}

export class Timeline extends Animation {
  readonly children: Array<{ item: Animation; start: number }>
  readonly labels: Record<string, number>
  to(targets: Target, vars: TweenVars, position?: string | number): this
  from(targets: Target, vars: TweenVars, position?: string | number): this
  fromTo(targets: Target, fromVars: TweenVars, toVars: TweenVars, position?: string | number): this
  set(targets: Target, vars: TweenVars, position?: string | number): this
  add(animation: Animation | (() => void), position?: string | number): this
  call(callback: (...args: any[]) => void, params?: any[], position?: string | number): this
  addLabel(name: string, position?: string | number): this
  removeLabel(name: string): this
  currentLabel(): string
  currentLabel(name: string): this
  nextLabel(): string | null
  previousLabel(): string | null
  addPause(position?: string | number, callback?: () => void, params?: any[]): this
  tweenTo(position: string | number, vars?: TweenVars): Tween
  tweenFromTo(from: string | number, to: string | number, vars?: TweenVars): Tween
  defaults(): TweenVars
  defaults(vars: TweenVars): this
  getChildren(nested?: boolean): Animation[]
  remove(animation: Animation): this
  clear(): this
}

export class ScrollScene {
  readonly trigger: Element | null
  readonly animation: Animation | null
  progress: number
  start: number
  end: number
  refresh(): this
  update(): this
  kill(): this
}

export interface Context {
  animations: Animation[]
  scenes: ScrollScene[]
  gestures: any[]
  add<T>(callback: () => T): T
  revert(): void
}

export interface Plugin {
  name?: string
  id?: string
  register?(twexom: Twexom, internals: any): void
  init?(twexom: Twexom, internals: any): void
}

export interface Twexom {
  version: string
  ease: Record<string, (progress: number) => number>
  to(targets: Target, vars: TweenVars): Tween | Timeline
  from(targets: Target, vars: TweenVars): Tween
  fromTo(targets: Target, fromVars: TweenVars, toVars: TweenVars): Tween
  set(targets: Target, vars: TweenVars): Tween
  timeline(vars?: TweenVars): Timeline
  scroll: {
    (vars?: ScrollVars): ScrollScene
    refresh(): void
    update(): void
    getAll(): ScrollScene[]
  }
  drag(targets: Target, vars?: Record<string, any>): any
  context(callback: (context?: Context) => void): Context
  matchMedia(conditions: Record<string, any>, callback: (conditions: any) => void): { revert(): void }
  quickTo(target: Target, property: string, vars?: TweenVars): (value: Value) => Tween
  quickSetter(target: Target, property: string): (value: any) => void
  getProperty(target: Target, property: string): any
  getTweensOf(targets: Target): Tween[]
  killTweensOf(targets: Target): void
  getById(id: string): Animation | null
  delayedCall(delay: number, callback: (...args: any[]) => void, params?: any[]): Animation
  register(...plugins: Array<Plugin | ((twexom: Twexom, internals: any) => void)>): this
  registerPlugin(...plugins: Array<Plugin | ((twexom: Twexom, internals: any) => void)>): this
  registerEffect(name: string, effect: Function): this
  configure(vars?: Record<string, any>): this
  config(vars?: Record<string, any>): this
  ticker: {
    add(callback: (delta: number, time: number) => void): Function
    remove(callback: Function): Function
    lagSmoothing(threshold?: number, adjusted?: number): any
    frame(): number
    deltaRatio(fps?: number): number
  }
  utils: {
    toArray(targets: Target): any[]
    clamp(min: number, max: number, value?: number): any
    mapRange(inMin: number, inMax: number, outMin: number, outMax: number, value?: number): any
    interpolate(start: any, end: any, progress?: number): any
    random(min: number, max: number, snap?: number): number
    snap(increment: number, value?: number): any
  }
  ScrollTrigger?: {
    create(vars?: ScrollVars): ScrollScene
    refresh(): void
    update(): void
    getAll(): ScrollScene[]
  }
  ScrollSmoother?: { create(vars?: Record<string, any>): any }
  ScrollToPlugin?: Record<string, any>
  CSSRulePlugin?: { getRule(selector: string): CSSStyleDeclaration | null }
  normalizeScroll?: (vars?: Record<string, any>) => any
  Draggable?: { create(targets: Target, vars?: Record<string, any>): any[] }
  Observer?: { create(vars?: Record<string, any>): any }
  Flip?: { getState(targets: Target): any; from(state: any, vars?: TweenVars): Timeline; to(state: any, vars?: TweenVars): Timeline; fit(target: Target, destination: Target, vars?: TweenVars): Tween | null }
  SplitText?: new (targets: Target, vars?: Record<string, any>) => any
  CustomEase?: { create(id: string, path: string): (progress: number) => number }
  CustomBounce?: { create(id?: string, vars?: Record<string, any>): (progress: number) => number }
  CustomWiggle?: { create(id?: string, vars?: Record<string, any>): (progress: number) => number }
  RoughEase?: { create(id?: string, vars?: Record<string, any>): (progress: number) => number }
  SlowMo?: { create(id?: string, linearRatio?: number, power?: number): (progress: number) => number }
  SteppedEase?: { create(id?: string, steps?: number): (progress: number) => number }
  MotionPathPlugin?: Record<string, any>
  DrawSVGPlugin?: Record<string, any>
  MorphSVGPlugin?: Record<string, any>
  TextPlugin?: Record<string, any>
  ScrambleTextPlugin?: Record<string, any>
  Physics2DPlugin?: Record<string, any>
  PhysicsPropsPlugin?: Record<string, any>
  InertiaPlugin?: Record<string, any>
  DevTools?: { create(vars?: Record<string, any>): any }
  debug?: (vars?: Record<string, any>) => any
}

declare const twexom: Twexom
export { twexom }
export default twexom
export declare const ease: Twexom['ease']
export declare const to: Twexom['to']
export declare const from: Twexom['from']
export declare const fromTo: Twexom['fromTo']
export declare const set: Twexom['set']
export declare const timeline: Twexom['timeline']
export declare const scroll: Twexom['scroll']
export declare const context: Twexom['context']
export declare const register: Twexom['register']
export declare const registerEffect: Twexom['registerEffect']
