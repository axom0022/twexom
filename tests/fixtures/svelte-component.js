import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';

Svelte_source[$.FILENAME] = 'tests/fixtures/svelte-source.svelte';

import * as $ from 'svelte/internal/client';
import { twexom } from '../../adapters/svelte.js';

var root = $.add_locations($.from_html(`<div id="svelte-target"></div>`), Svelte_source[$.FILENAME], [[6, 0]]);

export default function Svelte_source($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, false, Svelte_source);

	const vars = {
		x: 100,
		duration: 1,
		ease: 'linear',
		paused: true,
		id: 'svelte-host'
	};

	var $$exports = { ...$.legacy_api() };
	var div = root();

	$.action(div, ($$node, $$action_arg) => twexom?.($$node, $$action_arg), () => vars);
	$.append($$anchor, div);

	return $.pop($$exports);
}
