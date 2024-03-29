<script>
	import {
		applyFnMap,
		isIterableNotEmpty,
		mergeObj,
		transformValues,
	} from '@svizzle/utils';
	import {max} from 'd3-array';
	import {quadtree} from 'd3-quadtree';
	import {scaleLinear} from 'd3-scale';
	import {line, curveMonotoneX} from 'd3-shape';
	import * as _ from 'lamb';
	import {writable} from 'svelte/store';

	// lib/stores
	import {_availableYears} from '../stores/indicator.js';
	import {_timelineLayout as _layout} from '../stores/layout.js';
	import {_trends} from '../stores/trends.js';

	// lib/utils
	import {getOrder} from '../utils/domain.js';

	/* consts */

	const gap = 4;
	const labelFontSize = 14;
	const axisFontSize = 12;
	const tooltipFontSize = 10;
	const tooltipPadding = 5;
	const tooltipShift = 1.5 * tooltipPadding + 0.5 * tooltipFontSize;

	/* props */

	export let colorScale = null;
	export let data = null;
	export let formatFn = null;
	export let getIndicatorValue = null;
	export let height = null;
	export let schema = null;
	export let types = null;
	export let useRankScale = false;
	export let width = null;

	/* local vars */

	let highlightedId;

	/* reactive vars */

	// data
	$: maxOrder = max(data.rankedData, getOrder);

	// layout
	$: X1 = $_layout.fullScaleX(data.year_extent[0]);
	$: X2 = $_layout.fullScaleX(data.year_extent[1]);
	$: x1 = $_layout.scaleX(data.year_extent[0]);
	$: x2 = $_layout.scaleX(data.year_extent[1]);
	$: xMed = (x1 + x2) / 2;
	$: yMin = $_layout.radius + 2 * gap + labelFontSize;
	$: yMax = height - Math.max($_layout.radius, axisFontSize / 2) - gap;
	$: yLabel = gap + labelFontSize / 2;
	$: labelUnit =
		schema.value.unit_string ||
		schema.value.type &&
		_.has(types, schema.value.type) &&
		_.has(types[schema.value.type], 'unit_string') &&
		types[schema.value.type].unit_string;
	$: scaleY = useRankScale
		? scaleLinear().domain([0, maxOrder]).range([yMin, yMax])
		: scaleLinear().domain(data.valueExtext).range([yMax, yMin]);
	$: ticks = scaleY && scaleY.ticks().map(value => ({
		label: useRankScale ? value + 1 : formatFn(value),
		y: scaleY(value)
	}));
	$: getX = d => $_layout.scaleX(d.year);
	$: getY = d => useRankScale ? scaleY(d.order) : scaleY(getIndicatorValue(d));
	$: lineGenerator =
		line()
		.x(getX)
		.y(getY)
		.curve(curveMonotoneX);
	$: trendLines = _.map($_trends, transformValues({
		key: Number,
		value: applyFnMap({
			path: lineGenerator,
			isSelected: points => points[0].isSelected
			// all points have same `id`, so same selection status
		})
	}));

	// color
	$: getStopOffset = d => `${100 * $_layout.scaleX(d.year) / width}%`;
	$: gradients = _.map($_trends, transformValues({
		value: _.mapWith(applyFnMap({
			offset: getStopOffset,
			stopColor: _.pipe([getIndicatorValue, colorScale])
		}))
	}));

	$: chartTitle = `${useRankScale ? 'Ranking by ' : ''}${schema.value.label}`;

	// tooltip

	$: quadTree = isIterableNotEmpty(data.selectionData) &&
		quadtree()
		.x(getX)
		.y(getY)
		.addAll(data.selectionData)
		.extent([[x1, 0], [x2, height]]);

	const tooltipDefault = {isVisible: false};
	const _tooltip = writable(tooltipDefault);

	const onMouseMove = event => {
		const {offsetX, offsetY} = event;

		if (offsetX < x1 || offsetX > x2 || !quadTree) {
			_tooltip.set(tooltipDefault);
			return;
		}

		const datum = quadTree.find(offsetX, offsetY);
		const {region_id, region: {id, name}} = datum;

		highlightedId = id;
		const dotX = getX(datum);
		const dotY = getY(datum);
		const isRight = dotX > (X1 + X2) / 2;
		const shiftX = isRight ? -tooltipShift : tooltipShift;
		const shiftY =
			Math.max(
				yMin + tooltipShift,
				Math.min(dotY, yMax - tooltipShift)
			) - dotY;

		_tooltip.update(mergeObj({
			...datum,
			dotX,
			dotY,
			isRight,
			isVisible: true,
			label: `${name} (${region_id})`,
			shiftX,
			shiftY,
			value: formatFn(getIndicatorValue(datum)),
		}));
	}

	const onMouseLeave = () => {
		_tooltip.set(tooltipDefault);
	}
</script>

<g class='TrendsG'>
	<rect
		{height}
		{width}
		class='sensor'
		on:mouseleave={onMouseLeave}
		on:mousemove={onMouseMove}
	/>

	{#if $_trends.length}
		<defs>
			{#each gradients as {key, value}}
				<linearGradient
					id={key}
					gradientUnits='userSpaceOnUse'
				>
					{#each value as {offset, stopColor}}
						<stop {offset} stop-color={stopColor} />
					{/each}
				</linearGradient>
			{/each}
		</defs>

		<!-- axes -->

		<g class='axes'>
			<text
				class='label'
				x='{xMed}'
				y={yLabel}
				font-size={labelFontSize}
			>
				<tspan>{chartTitle}</tspan>
				{#if labelUnit}
					<tspan>[{labelUnit}]</tspan>
				{/if}
			</text>
			<g class='ref x'>
				{#each $_availableYears as year}
					<line
						x1={$_layout.scaleX(year)}
						x2={$_layout.scaleX(year)}
						y1={yMin}
						y2={yMax}
					/>
				{/each}
			</g>
			<g
				class='ref left'
				transform='translate({x1},0)'
			>
				{#each ticks as {label, y}}
					<line x2='-10' y1={y} y2={y} />
					<text dx='-15' dy={y} font-size={axisFontSize}>{label}</text>
				{/each}
			</g>
			<g
				class='ref right'
				transform='translate({x2},0)'
			>
				{#each ticks as {label, y}}
					<line x2='10' y1={y} y2={y} />
					<text dx='15' dy={y} font-size={axisFontSize}>{label}</text>
				{/each}
			</g>
		</g>

		<!-- curves -->

		<g class='curves'>
			{#each trendLines as {key, value: {path, isSelected}}}
				<path
					class:deselected={!isSelected}
					class:dimmed='{$_tooltip.isVisible && highlightedId !== key}'
					class:focused='{$_tooltip.isVisible && highlightedId === key}'
					d={path}
					stroke='url(#{key})'
				/>
			{/each}
		</g>

		<!-- single year: dots -->

		{#if $_availableYears.length === 1}
			<g>
				{#each $_trends as {value}}
					{#each value as d}
						<circle
							cx={getX(d)}
							cy={getY(d)}
							r={$_layout.radius}
						/>
					{/each}
				{/each}
			</g>
		{/if}

		<!-- tooltip -->

		{#if $_tooltip.isVisible}
			<g
				class='marker'
				transform='translate({$_tooltip.dotX},{$_tooltip.dotY})'
			>
				<circle r={$_layout.radius} />
				<g
					class:right={$_tooltip.isRight}
					transform='translate({$_tooltip.shiftX},{$_tooltip.shiftY})'
				>
					<text dy={-tooltipShift} class='bkg'>{$_tooltip.value}</text>
					<text dy={-tooltipShift}>{$_tooltip.value}</text>
					<text dy={tooltipShift} class='bkg'>{$_tooltip.label}</text>
					<text dy={tooltipShift}>{$_tooltip.label}</text>
				</g>
			</g>
		{/if}

	{:else}
		<text
			class='message'
			x={width / 2}
			y={height / 2}
		>No data</text>
	{/if}
</g>

<style>
	.sensor {
		fill-opacity: 0;
	}

	.ref line {
		stroke: var(--colorRefLight);
		pointer-events: none;
	}
	.x line {
		stroke-dasharray: 2 2;
		pointer-events: none;
	}
	text {
		fill: var(--colorRef);
		dominant-baseline: middle;
		font-weight: var(--dimFontWeight);
		stroke: none;
		pointer-events: none;
	}
	text.label,
	text.message {
		text-anchor: middle;
		dominant-baseline: middle;
	}
	text.label tspan:nth-child(1) {
		font-weight: bold;
	}
	text.label tspan:nth-child(2) {
		font-style: italic;
	}
	.left text {
		text-anchor: end;
	}
	.right text {
		text-anchor: start;
	}
	path {
		fill: none;
		pointer-events: none;
	}
	path.focused {
		stroke-width: 3;
		stroke-opacity: 1 !important;
		stroke-dasharray: 10 4;
	}
	path.dimmed {
		stroke-opacity: 0.6;
	}
	path.deselected {
		stroke-width: 0.75;
		stroke-opacity: 0.25;
	}
	circle {
		fill: var(--colorWhite);
		stroke: var(--colorBlack);
		stroke-width: 1.5;
		pointer-events: none;
	}

	/* marker */

	.marker text {
		fill: var(--colorBlack);
		dominant-baseline: middle;
		pointer-events: none;
	}
	.marker text.bkg {
		fill: none;
		stroke: var(--colorWhite);
		stroke-width: 5;
		stroke-linecap: round;
		stroke-linecap: round;
	}
	.marker .right text {
		text-anchor: end;
	}
</style>
