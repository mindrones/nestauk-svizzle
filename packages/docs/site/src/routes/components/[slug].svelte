<script context='module'>
	import {lookup} from './_utils.js';

	// eslint-disable-next-line no-unused-vars
	export function preload ({params, query}) {
		return lookup[params.slug];
	}
</script>

<script>
	import {makeKeyed} from '@svizzle/utils';
	import * as _ from 'lamb';
	import JSONTree from 'svelte-json-tree';

	import Elements from '$lib/components/Elements.svelte';

	import components from './_components.js';

	const makeKeyedEmptyString = makeKeyed('');

	export let data;
	export let doc;
	export let events;
	export let name;
	export let namespace;
	export let title;

	// FIXME https://github.com/sveltejs/svelte/issues/4442
	$: namespace = namespace || 'html';

	let instance;
	let width;
	let height;

	$: isSVG = namespace === 'svg';
	$: component = components[name];
	$: selected = data && 0;
	$: currentData = data[selected];
	$: payloads = currentData && events ? makeKeyedEmptyString(events) : null;
	$: displayProps = _.pairs(currentData.props);

	const makeEventHandler = eventName =>
		event => {
			payloads = _.setIn(payloads, eventName, JSON.stringify(event.detail));
		};

	let eventRemovers = [];
	$: if (data && instance) {
		eventRemovers.forEach(remove => remove());
		eventRemovers = [];

		events && events.forEach(eventName => {
			const eventHandler = makeEventHandler(eventName);
			const eventRemover = instance.$on(eventName, eventHandler);
			eventRemovers.push(eventRemover);
		});
	}
</script>

<svelte:head>
	<title>{name}: {title} - Svizzle</title>
</svelte:head>

<main>
	<h1>{title}</h1>
	<div class='col col1'>

		<!-- doc -->
		<div class='distancer'>
			<Elements elements={doc} />
		</div>

		<!-- select -->
		{#if data.length > 1}
			<div class='distancer'>
				<h2>Choose an example</h2>
				<div class='distancer'>
					<select
						on:change={event => {selected = Number(event.target.value)}}
						size={data.length}
					>
						{#each data as {key}, index}
							<option
								value={index}
								selected={index === selected}
							>{key}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		<!-- events -->
		{#if payloads}
			<h2>Events</h2>
			<div class='distancer'>
				{#each _.pairs(payloads) as [key, value]}
					<div class='row'>
						<span>{key}</span>
						<pre>{value || '[payload]'}</pre>
					</div>
				{/each}
			</div>
		{/if}

		<!-- usage -->
		<div class='distancer'>
			<h2>Usage</h2>
			<pre>{currentData.usage}</pre>
		</div>

		<!-- props -->
		<div class='distancer'>
			<h2>Props</h2>
			{#each displayProps as [propName, propValue]}
				<h3><code>{propName}</code></h3>
				<div class='distancer'>
					<JSONTree value={propValue} />
				</div>
			{/each}
		</div>

	</div>

	<div class='col col2'>
		{#if isSVG}
			<div class='svgwrapper'
				bind:clientWidth='{width}'
				bind:clientHeight='{height}'
			>
				<svg {width} {height}>
					<svelte:component
						bind:this={instance}
						this={component}
						{...{...currentData.props, width, height}}
					>
						{#if currentData.content}
							{currentData.content}
						{:else if currentData.slots}
							{#each currentData.slots as {items}}
								<!-- `slotName` to be used when dynamic slots will be supported -->
								{#each items as {componentName, content, elementName, props}}
									{#if elementName}
										<svelte:element
											{...props}
											this={elementName}
										>{content}</svelte:element>
									{:else if componentName}
										<svelte:component
											{...props}
											this={components[componentName]}
										>{content}</svelte:component>
									{/if}
								{/each}
							{/each}
						{/if}
					</svelte:component>
				</svg>
			</div>
		{:else}
			<svelte:component
				{...currentData.props}
				bind:this={instance}
				this={component}
			>
				{#if currentData.content}
					{currentData.content}
				{:else if currentData.slots}
					{#each currentData.slots as {items}}
						<!-- `slotName` to be used when dynamic slots will be supported -->
						{#each items as {componentName, content, elementName, props}}
							{#if elementName}
								<svelte:element
									{...props}
									this={elementName}
								>{content}</svelte:element>
							{:else if componentName}
								<svelte:component
									{...props}
									this={components[componentName]}
								>{content}</svelte:component>
							{/if}
						{/each}
					{/each}
				{/if}
			</svelte:component>
		{/if}
	</div>
</main>

<style>
	main {
		column-gap: 0.5rem;
		display: grid;
		grid-template-columns: 50% 50%;
		grid-template-rows: 3rem calc(100% - 3rem);
		height: 100%;
		padding: 0.5rem;
		width: 100%;
	}

	h1 {
		grid-column: 1 / span 2;
		grid-row: 1 / span 1;
		margin: 0;
		width: 100%;
	}

	svg {
		display:block;
	}

	.col {
		grid-row: 2 / span 1;
		padding: var(--dim-padding-minor);
	}
	.col1 {
		grid-column: 1 / span 1;
		overflow-y: auto;
	}

	.distancer {
		margin-bottom: 1rem;
	}

	.row {
		align-items: center;
		display: flex;
		height: 2rem;
		margin-bottom: 1rem;
		width: 100%;
	}

	.row span:nth-child(1) {
		flex: 0 0 15%;
	}
	.row span:nth-child(2) {
		flex: 1;
	}

	select {
		appearance: none;
		font-family: inherit;
		font-size: 1.05rem;
		outline: none;
		overflow-y: auto;
		position: relative;
		user-select: none;
	}

	option {
		appearance: none;
		cursor: pointer;
		outline: 0 none;
		padding: 0.5rem;
		user-select: none;
	}
	option[selected=true] {
		background: linear-gradient(#FFC894,#FFC894);
		background-color: red !important;
	}

	pre {
		width: 100%;
	}

	.col2 {
		border: 1px solid lightgrey;
		box-shadow: 1px 1px 4px 1px lightgrey;
		grid-column: 2 / span 1;
		overflow-y: auto;
		position: relative;
	}
	.col2 .svgwrapper {
		height: 100%;
		width: 100%;
	}
</style>
