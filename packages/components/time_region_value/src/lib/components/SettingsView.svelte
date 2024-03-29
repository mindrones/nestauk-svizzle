<script>
	import {Switch, XorSelector} from '@svizzle/ui';

	// lib/stores
	import {
		_colorSchemeLabel,
		_colorSchemeLabels,
		toggleColorScheme,
	} from '../stores/colors.js';
	import {_availableLevels} from '../stores/regionSettings.js';
	import {
		_currentLevel,
		_focusedRoot,
		_focusedRootDescendants,
		_focusedRootId,
		_isMenuExpanded,
		_roots,
		deselectAllFocusedRootChildren,
		deselectAllRoots,
		focusRoot,
		selectAllFocusedRootChildren,
		selectAllRoots,
		toggleFocusedRootDescendant,
		toggleRoot,
	} from '../stores/selectedRegions.js';

	// lib/components
	import RegionsSelector from './RegionsSelector.svelte';

	const defaultHandlers = {
		toggledFiltering: null,
		toggledRanking: null,
	}

	export let flags = {
		doFilter: false,
		showRankingControl: false,
	}
	export let handlers = defaultHandlers;

	// FIXME https://github.com/sveltejs/svelte/issues/4442
	$: handlers = handlers ? {...defaultHandlers, ...handlers} : defaultHandlers;

	$: count = flags.showRankingControl ? 3 : 2;

	/* event handlers */

	const focusedRoot = ({detail: rootId}) => focusRoot(rootId);
	const toggledRoot = ({detail: rootId}) => toggleRoot(rootId);
	const toggledRegion = ({detail: regionId}) => toggleFocusedRootDescendant(regionId);
</script>

<div class='SettingsView'>

	<!-- geo selection -->

	<div class='optgroup'>
		<h2>1/{count}: regions</h2>
		<Switch
			value={flags.doFilter ? 'Filter' : 'Highlight'}
			values={['Highlight', 'Filter']}
			on:toggled={handlers.toggledFiltering}
		/>

		<XorSelector
			on:changed={handlers.setLevel}
			value={$_currentLevel}
			values={$_availableLevels}
		/>

		<div class='roots'>
			<RegionsSelector
				focusedId={$_focusedRootId}
				items={$_roots}
				on:deselectedAll={deselectAllRoots}
				on:focused={focusedRoot}
				on:selectedAll={selectAllRoots}
				on:toggled={toggledRoot}
				showFocusedItem={$_isMenuExpanded}
				title='Countries'
			/>
		</div>

		{#if $_isMenuExpanded}
			<div class='descendants'>
				<RegionsSelector
					items={$_focusedRootDescendants}
					on:deselectedAll={deselectAllFocusedRootChildren}
					on:selectedAll={selectAllFocusedRootChildren}
					on:toggled={toggledRegion}
					title='{$_currentLevel}: {$_focusedRoot.name}'
				/>
			</div>
		{/if}
	</div>

	<!-- color scale -->

	<div class='optgroup'>
		<h2>2/{count}: Color scale</h2>
		<Switch
			value={$_colorSchemeLabel}
			values={$_colorSchemeLabels}
			on:toggled={toggleColorScheme}
		/>
	</div>

	<!-- ranking -->

	{#if flags.showRankingControl}
		<div class='optgroup'>
			<h2>3/{count}: Y scale</h2>
			<Switch
				value='Absolute'
				values={['Absolute', 'Ranking']}
				on:toggled={handlers.toggledRanking}
			/>
		</div>
	{/if}
</div>

<style>
	.SettingsView {
		align-items: center;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: flex-start;
		overflow-y: auto;
		width: 100%;
	}

	.optgroup {
		align-items: center;
		background-color: white;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		justify-content: center;
		padding: 0.5rem 0.5rem 1rem 0.5rem;
		width: 100%;
	}
	.optgroup:not(:last-child) {
		margin-bottom: 1.5rem;
	}
	h2 {
		margin-bottom: 1rem;
	}
</style>
