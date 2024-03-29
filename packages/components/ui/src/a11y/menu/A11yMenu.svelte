<script>
	import {makeStyleVars, toPx} from '@svizzle/dom';
	import {isNotNil, isNumber} from '@svizzle/utils';
	import * as _ from 'lamb';

	import ArrowLeftCircle from '../../icons/feather/ArrowLeftCircle.svelte';
	import ArrowRightCircle from '../../icons/feather/ArrowRightCircle.svelte';
	import ChevronLeft from '../../icons/feather/ChevronLeft.svelte';
	import ChevronRight from '../../icons/feather/ChevronRight.svelte';
	import MinusCircle from '../../icons/feather/MinusCircle.svelte';
	import PlusCircle from '../../icons/feather/PlusCircle.svelte';
	import ColorClear from '../../icons/svizzle/ColorClear.svelte';
	import FormatClear from '../../icons/svizzle/FormatClear.svelte';
	import Icon from '../../icons/Icon.svelte';
	import Switch from '../../Switch.svelte';
	import {
		_currentSetting,
		_formatValue,
		_groupsResetStatus,
		_hasNext,
		_hasPrev,
		resetGroup,
		setNextId,
		setPrevId,
		updateCurrentValue,
	} from './settings.js';

	export let _screen;
	export let theme;

	let menuWidth; // bound

	const gap = 24;

	const defaultTheme = {
		colorBackground: 'white',
		colorBorder: 'black',
		colorKnob: 'gray',
		colorDisabled: 'silver',
		colorText: 'black',
	};

	$: label =
		`${$_currentSetting.label}: ${$_formatValue($_currentSetting.value)}`;
	$: settingValues = $_currentSetting.values || [];
	$: getValueWidth = value => $_formatValue(value).length * $_screen?.glyph.width;
	$: useRadios = menuWidth >= _.reduce(
		settingValues,
		(acc, value) => getValueWidth(value) + gap + acc,
		0
	);
	$: hasNumericValues = isNumber(settingValues[0])
	$: currentValueIndex = _.findIndex(
		settingValues,
		_.is($_currentSetting.value)
	);
	$: prevValue = settingValues[currentValueIndex - 1];
	$: nextValue = settingValues[currentValueIndex + 1];
	$: hasPrevValue = isNotNil(prevValue);
	$: hasNextValue = isNotNil(nextValue);
	$: clickedPrev =
		() => hasPrevValue && updateCurrentValue(prevValue);
	$: clickedNext =
		() => hasNextValue && updateCurrentValue(nextValue);
	$: theme = {...defaultTheme, ...theme};
	$: switchTheme = {
		color: theme.colorText,
		backgroundColor: theme.colorBackground,
		knobColor: theme.colorKnob
	}
	$: style = makeStyleVars({gap: toPx(gap), ...theme});
</script>

<dialog
	{style}
	aria-label='Accessibility settings'
	class={$_screen?.classes}
>
	<nav class='resets'>
		<button
			aria-label='Reset text accessibility adjustments'
			class='text'
			class:clickable={!$_groupsResetStatus.text}
			on:click={() => resetGroup('text')}
		>
			<Icon
				fill={
					$_groupsResetStatus.text ? theme.colorDisabled : theme.colorText
				}
				glyph={FormatClear}
				stroke='none'
			/>
		</button>
		<button
			aria-label='Reset color accessibility adjustments'
			class='color'
			class:clickable={!$_groupsResetStatus.color}
			on:click={() => resetGroup('color')}
		>
			<Icon
				fill={
					$_groupsResetStatus.color ? theme.colorDisabled : theme.colorText
				}
				glyph={ColorClear}
				stroke='none'
			/>
		</button>
	</nav>
	<menu bind:clientWidth={menuWidth}>
		<label for=''>{label}</label>
		{#if $_currentSetting.values}
			<div class='controlContainer'>
				{#if useRadios}
					{#each $_currentSetting.values as value, index}
						<div>
							<label for='input-{index}'>
								{$_formatValue(value)}
							</label>
							<input
								id='input-{index}'
								checked={$_currentSetting.value === value}
								class='clickable'
								on:change={() => updateCurrentValue(value)}
								type='radio'
								{value}
							>
						</div>
					{/each}
				{:else}
					<button
						aria-label={`Previous ${hasNumericValues ? 'numeric' : 'alphanumeric'} value`}
						class:clickable={hasPrevValue}
						disabled={!hasPrevValue}
						on:click={clickedPrev}
					>
						<Icon
							glyph={hasNumericValues ? MinusCircle : ArrowLeftCircle}
							stroke={
								hasPrevValue ? theme.colorText : theme.colorDisabled
							}
						/>
					</button>
					<button
						aria-label={`Next ${hasNumericValues ? 'numeric' : 'alphanumeric'} value`}
						class:clickable={hasNextValue}
						disabled={!hasNextValue}
						on:click={clickedNext}
					>
						<Icon
							glyph={hasNumericValues ? PlusCircle : ArrowRightCircle}
							stroke={
								hasNextValue ? theme.colorText : theme.colorDisabled
							}
						/>
					</button>
				{/if}
			</div>
		{:else if $_currentSetting.range}
			<div class='slider'>
				<span>
					{$_formatValue($_currentSetting.range[0])}
				</span>
				<input
					class='clickable'
					max={$_currentSetting.range[1]}
					min={$_currentSetting.range[0]}
					name={$_currentSetting.id}
					on:input={({target: {value}}) => updateCurrentValue(value)}
					type='range'
					value={$_currentSetting.value}
				>
				<span>
					{$_formatValue($_currentSetting.range[1])}
				</span>
			</div>
		{:else if $_currentSetting.format === 'boolean'}
			<Switch
				on:toggled={({detail}) => updateCurrentValue(detail === 'Yes')}
				theme={switchTheme}
				value={$_formatValue($_currentSetting.value)}
				values={['No', 'Yes']}
			/>
		{/if}
	</menu>
	<nav class='nav'>
		<button
			aria-label='Previous Setting'
			class:clickable={$_hasPrev}
			disabled={!$_hasPrev}
			on:click={setPrevId}
		>
			<Icon
				glyph={ChevronLeft}
				stroke={
					$_hasPrev ? theme.colorText : theme.colorDisabled
				}
			/>
		</button>
		<button
			aria-label='Next Setting'
			class:clickable={$_hasNext}
			disabled={!$_hasNext}
			on:click={setNextId}
		>
			<Icon
				glyph={ChevronRight}
				stroke={
					$_hasNext ? theme.colorText : theme.colorDisabled
				}
			/>
		</button>
	</nav>
</dialog>

<style>
	dialog {
		background: var(--colorBackground);
		border: none;
		border-bottom: thin solid var(--colorBorder);
		border-top: thin solid var(--colorBorder);
		color: var(--colorText);
		display: grid;
		font-family: sans-serif;
		font-size: 16px;
		grid-template-areas: 'resets proppanel nav';
		grid-template-columns: min-content 1fr min-content;
		height: 80px;
		letter-spacing: 0;
		line-height: 24px;
		position: relative;
		width: 100%;
		word-spacing: 0;
	}

	nav {
		display: grid;
		grid-template-areas: 'upper' 'lower';
		grid-template-rows: 50% 50%;
		grid-area: nav;
	}
	.resets {
		grid-area: resets;
	}
	menu {
		display: grid;
		grid-area: proppanel;
		justify-items: center;
	}
	label {
		display: block;
		text-align: center;
		white-space: nowrap;
	}
	span, label {
		user-select: none;
	}
	.controlContainer {
		display: grid;
		gap: var(--gap);
		grid-auto-columns: 1fr;
		grid-auto-flow: column;
		text-align: center;
		width: min-content;
	}
	button, .text, .color {
		align-items: center;
		background: var(--colorBackground);
		border: none;
		border-left: thin solid var(--colorBorder);
		border-right: thin solid var(--colorBorder);
		box-sizing: border-box;
		display: block;
		display: grid;
		height: 39px;
		justify-items: center;
		margin: 0;
		text-align: center;
		width: 39px;
	}
	.controlContainer button {
		border: none;
		width: min-content;
		height: min-content;
	}
	nav :first-child {
		border-bottom: thin solid var(--colorBorder);
	}
	.slider {
		align-items: center;
		display: grid;
		gap: 8px;
		grid-auto-flow: column;
	}
	input[type='range'] {
		-webkit-appearance: none;
	}
	input[type='range']:focus {
		outline: none;
	}
	input[type='range']::-moz-range-track {
		background: var(--colorText);
		border: none;
		box-sizing: border-box;
		height: 1px;
		width: 129px;
	}
	input[type='range']::-webkit-slider-runnable-track {
		-webkit-appearance: none;
		background: var(--colorText);
		border: none;
		box-sizing: border-box;
		height: 1px;
		width: 129px;
	}
	input[type='range']::-moz-range-thumb {
		background: var(--colorText);
		border-radius: 50%;
		border: none;
		height: 19px;
		margin-top: -9px;
		width: 19px;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		background: var(--colorText);
		border-radius: 50%;
		border: none;
		height: 19px;
		margin-top: -9px;
		width: 19px;
	}
	.clickable {
		cursor: pointer;
	}
</style>
