<script>
	import {isServerSide} from '@svizzle/ui';
	import {isNotNil} from '@svizzle/utils';
	import * as _ from 'lamb';

	// lib/stores
	import {_yearRange} from '../stores/dataset.js';
	import {_timelineLayout as _layout} from '../stores/layout.js';
	import {_hrefBase} from '../stores/navigation.js';

	// lib/utils
	import {shortenYear} from '../utils/format.js';
	import {makeURL} from '../utils/url.js';

	const zeroIfNaN = _.when(isNaN, _.always(0));

	export let availableYears = null;
	export let height = null;
	export let indicatorId = null;
	export let selectedYear = null;
	export let showLess = false;
	export let width;

	$: yearsY = availableYears?.length > 0 ? $_layout.y2 : $_layout.ym;

	/* buttons */

	$: halfHeight = $_layout.height / 2;
	$: buttonY = halfHeight / 2;
	$: prevX = buttonY;
	$: nextX = buttonY + halfHeight + 0.25 * buttonY;
	$: yearsCenterX = (nextX + halfHeight + width) / 2;
	$: min = halfHeight / 3;
	$: max = 2 * min;
	$: med = halfHeight / 2;
	$: lineX1 = zeroIfNaN($_layout.scaleX(availableYears[0]) + $_layout.radius);
	$: lineX2 = zeroIfNaN($_layout.scaleX(_.last(availableYears)) - $_layout.radius);
	$: chevronLeftPath = `${max} ${min} ${min} ${med} ${max} ${max}`;
	$: chevronRightPath = `${min} ${min} ${max} ${med} ${min} ${max}`;
	$: selectedYearIndex = _.findIndex(availableYears, _.is(selectedYear));
	$: prevYear = availableYears[selectedYearIndex - 1];
	$: isPrevYearActive = isNotNil(prevYear);
	$: nextYear = availableYears[selectedYearIndex + 1];
	$: isNextYearActive = isNotNil(nextYear);
	$: hrefPrev = isPrevYearActive
		? makeURL($_hrefBase, indicatorId, prevYear)
		: null;
	$: hrefNext = isNextYearActive
		? makeURL($_hrefBase, indicatorId, nextYear)
		: null;
</script>

<div class='Timeline'>
	{#if width && height && $_layout || isServerSide}
		<svg
			{width}
			{height}
		>
			<!-- buttons -->
			{#if selectedYear}

				<!-- prev -->
				<g
					transform='translate({prevX},{buttonY})'
					class:active={isPrevYearActive}
				>
					{#if hrefPrev}
						<a
							aria-label='Show the previous year ({prevYear})'
							href={hrefPrev}
							rel='prefetch'
						>
							<rect
								height={halfHeight}
								width={halfHeight}
							/>
							<polyline points={chevronLeftPath} />
						</a>
					{:else}
						<g aria-label='Previous year not available'>
							<rect
								height={halfHeight}
								width={halfHeight}
							/>
							<polyline points={chevronLeftPath} />
						</g>
					{/if}
				</g>

				<!-- next -->
				<g
					transform='translate({nextX},{buttonY})'
					class:active={isNextYearActive}
				>
					{#if hrefNext}
						<a
							aria-label='Show the next year ({nextYear})'
							href={hrefNext}
							rel='prefetch'
						>
							<rect
								height={halfHeight}
								width={halfHeight}
							/>
							<polyline points={chevronRightPath} />
						</a>
					{:else}
						<g aria-label='Next year not available'>
							<rect
								height={halfHeight}
								width={halfHeight}
							/>
							<polyline points={chevronRightPath} />
						</g>
					{/if}
				</g>

			{/if}

			{#if showLess && selectedYear}

				<text
					x={yearsCenterX}
					y={halfHeight}
				>{selectedYear}</text>

			{:else}

				<!-- dots -->

				{#if availableYears}
					<g transform='translate(0,{$_layout.y1})'>
						<line
							x1={lineX1}
							x2={lineX2}
						/>
						{#each availableYears as year}
							<a
								aria-label={year}
								href={makeURL($_hrefBase, indicatorId, year)}
								rel='prefetch'
							>
								<circle
									class:selected='{selectedYear && selectedYear === year}'
									cx='{$_layout.scaleX(year)}'
									r={$_layout.radius}
								/>
							</a>
						{/each}
					</g>
				{/if}

				<!-- labels -->

				{#if $_yearRange}
					{#each $_yearRange as year}
						<text
							font-size={$_layout.fontSize}
							x={$_layout.scaleX(year)}
							y={yearsY}
						>{$_layout.doShortenYears ? shortenYear(year): year}</text>
					{/each}
				{/if}

			{/if}
		</svg>
	{/if}
</div>

<style>
	.Timeline {
		height: 100%;
		user-select: none;
		width: 100%;
	}

	svg {
		display: block;
	}
	svg text {
		dominant-baseline: middle;
		fill: var(--colorRef);
		pointer-events: none;
		stroke: none;
		text-anchor: middle;
	}

	svg line {
		pointer-events: none;
		stroke-width: 0.75;
		stroke: var(--colorRef);
	}

	svg circle {
		cursor: pointer;
		fill-opacity: 1;
		fill: var(--colorWhite);
		stroke-width: 1.5;
		stroke: var(--colorRef);
	}
	svg circle.selected {
		fill: var(--colorSelected);
	}

	/* buttons */

	rect {
		fill: var(--colorWhite);
	}
	polyline {
		fill: none;
		pointer-events: none;
		stroke-width: 2;
	}

	rect, polyline {
		stroke: var(--colorRefLight);
	}
	.active {
		cursor: pointer;
	}
	.active rect,
	.active polyline {
		stroke: var(--colorRef);
	}
</style>
