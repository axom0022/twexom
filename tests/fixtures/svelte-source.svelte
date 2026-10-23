<script>
  import { twexom } from '../../adapters/svelte.js'
  const vars = { x: 100, duration: 1, ease: 'linear', paused: true, id: 'svelte-host' }
</script>

<div id="svelte-target" use:twexom={vars}></div>
