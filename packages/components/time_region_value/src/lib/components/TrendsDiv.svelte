<script>
	// lib/components
	import TrendsG from './TrendsG.svelte';

	export let colorScale = null;
	export let data = null;
	export let formatFn = null;
	export let getIndicatorValue = null;
	export let schema = null;
	export let types = null;
	export let useRankScale = false;

	let height;
	let width;
</script>

<div
	bind:clientHeight={height}
	bind:clientWidth={width}
	class='TrendsDiv'
>
	{#if data && width && height}
		<svg
			height={height}
			width={width}
		>
			<TrendsG
				{colorScale}
				{data}
				{formatFn}
				{getIndicatorValue}
				{schema}
				{types}
				{useRankScale}
				height={height}
				width={width}
			/>
		</svg>
	{/if}
</div>

<style>
	.TrendsDiv {
		height: 100%;
		width: 100%;
	}
	svg {
		display: block;
	}
</style>
