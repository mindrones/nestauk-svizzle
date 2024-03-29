export const name = 'XorNavigator';
export const packageName = 'ui';
export const title = 'XorNavigator';
export const slug = `${packageName}-${name}`;
export const doc = [
	{tag: 'p', content: 'A navigator component allowing selection from a set of values with previous and next controls.'},
];
export const events = [
	'changed',
];
export const data = [
	{
		content: 'Basic Navigator',
		key: 'Basic usage',
		props: {
			currentValue: 'value1',
			label: 'navigator label',
			valuesToLabels: {
				value1: 'Label 1',
				value2: 'Label 2',
				value3: 'Label 3',
			},
		},
		usage: `
			<XorNavigator
				currentValue='value1'
				label='navigator label'
				on:change={onChange}
				valuesToLabels={{
					value1: 'Label 1',
					value2: 'Label 2',
					value3: 'Label 3',
				}}
			/>
		`,
	},
	{
		content: 'Custom theme',
		key: 'Custom theme',
		props: {
			currentValue: 'value1',
			theme: {
				border: '2px solid blue',
				colorBackground: 'lightyellow',
				colorIcon: 'blue',
				colorIconDisabled: 'lightgrey',
				textColor: 'darkblue',
			},
			valuesToLabels: {
				value1: 'Label 1',
				value2: 'Label 2',
				value3: 'Label 3',
			},
		},
		usage: `
			<XorNavigator
				currentValue='value1'
				on:change={onChange}
				theme={{
					border: '2px solid blue',
					colorBackground: 'lightyellow',
					colorIcon: 'blue',
					colorIconDisabled: 'lightgrey',
					textColor: 'darkblue',
				}}
				valuesToLabels={{
					value1: 'Label 1',
					value2: 'Label 2',
					value3: 'Label 3',
				}}
			/>
		`,
	},
];
