import { Directive, ElementRef, Input } from '@angular/core'
import engine from '../src/twexom.js'

export class TwexomDirectiveBase {
  constructor(elementRef) {
    this.elementRef = elementRef
    this.vars = {}
    this.context = null
  }

  ngOnInit() {
    this.context = engine.context(() => {
      if (typeof this.vars === 'function') this.vars(this.elementRef.nativeElement, engine)
      else engine.to(this.elementRef.nativeElement, this.vars || {})
    })
  }

  ngOnDestroy() {
    if (this.context) this.context.revert()
    this.context = null
  }
}

Input('twexom')(TwexomDirectiveBase.prototype, 'vars')
TwexomDirectiveBase.ctorParameters = () => [{ type: ElementRef }]
export const TwexomDirective = Directive({
  selector: '[twexom]',
  standalone: true
})(TwexomDirectiveBase)

export default TwexomDirective
