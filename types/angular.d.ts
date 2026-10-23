import type { ElementRef } from '@angular/core'
import type { TweenVars, Twexom, Context } from './index.js'

export declare class TwexomDirectiveBase {
  constructor(elementRef: ElementRef<HTMLElement>)
  vars: TweenVars | ((element: HTMLElement, twexom: Twexom) => void)
  context: Context | null
  ngOnInit(): void
  ngOnDestroy(): void
}
export declare const TwexomDirective: typeof TwexomDirectiveBase
export default TwexomDirective
