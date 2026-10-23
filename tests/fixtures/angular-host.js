import '@angular/compiler'
import 'zone.js'
import 'zone.js/testing'
import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing'
import { TwexomDirective } from '../../adapters/angular.js'
import engine from '../../src/twexom.js'

let initialized = false

export async function run() {
  if (!initialized) {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting())
    initialized = true
  }
  class Host {
    constructor() {
      this.vars = { x: 100, duration: 1, ease: 'linear', paused: true, id: 'angular-host' }
    }
  }
  const HostComponent = Component({
    selector: 'twexom-test-host',
    standalone: true,
    imports: [TwexomDirective],
    template: '<div id="angular-target" [twexom]="vars"></div>'
  })(Host)
  const fixture = TestBed.createComponent(HostComponent)
  fixture.detectChanges()
  await fixture.whenStable()
  const animation = engine.getById('angular-host')
  if (!animation) throw new Error('Angular adapter did not create its tween')
  animation.seek(0.5)
  const value = fixture.nativeElement.querySelector('#angular-target').style.transform
  fixture.destroy()
  const cleaned = !engine.getById('angular-host')
  return { value, cleaned }
}
