import twexom from './twexom.js'
import scrollplugin from './scroll.js'
import gesturesplugin from './gestures.js'
import motionpathplugin from './motionpath.js'
import flipplugin from './flip.js'
import svgplugin from './svg.js'
import textplugin from './text.js'
import physicsplugin from './physics.js'
import easingplugin from './easing.js'
import devtoolsplugin from './devtools.js'
import cssplugin from './css.js'

const plugins = [scrollplugin, gesturesplugin, motionpathplugin, flipplugin, svgplugin, textplugin, physicsplugin, easingplugin, devtoolsplugin, cssplugin]
twexom.register(...plugins)

export { twexom, scrollplugin, gesturesplugin, motionpathplugin, flipplugin, svgplugin, textplugin, physicsplugin, easingplugin, devtoolsplugin, cssplugin }
export default twexom
