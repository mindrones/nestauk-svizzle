#!/usr/bin/env node

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {tapMessage} from '@svizzle/dev';
import {saveExportedObj} from '@svizzle/file';
import {roundTo} from '@svizzle/utils';
import {pairs, shuffle} from 'd3-array';
import * as _ from 'lamb';

import colorsMap from '../lib/colorsMap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_EXAMPLES = path.resolve(__dirname, '../routes/components/_examples');

const BINS_PATH_1 = path.resolve(DIR_EXAMPLES, 'bins.js');
const BINS_COLOR_PATH_1 = path.resolve(DIR_EXAMPLES, 'binsFill.js');
const BINS_PATH_2 = path.resolve(DIR_EXAMPLES, 'bins_2.js');
const BINS_COLOR_PATH_2 = path.resolve(DIR_EXAMPLES, 'binsFill_2.js');
const BINS_PATH_3 = path.resolve(DIR_EXAMPLES, 'bins_3.js');
const BINS_COLOR_PATH_3 = path.resolve(DIR_EXAMPLES, 'binsFill_3.js');

const roundTo2 = roundTo(2);

const makeRandomObjects = (range, n) => _.map(
	_.range(0, n),
	() => ({value: roundTo2(range[0] + (range[1] - range[0]) * Math.random()) })
);
const makeBin = ([range, n]) => ({range, values: makeRandomObjects(range, n)});
const makeBins = (maxAmount, extent, interval = 1) => _.map(
	pairs(_.range(...extent, interval)),
	binRange => makeBin([binRange, Math.round(maxAmount * Math.random())])
);
const emptyOneBinAtRandom = bins => _.setPathIn(
	bins,
	`${Math.round(bins.length * Math.random())}.values`,
	[]
);
const makeRandomBins = (maxAmount, extent, interval, binsPath, colorsPath) => {
	const colorNames = shuffle(_.keys(colorsMap));
	const bins = emptyOneBinAtRandom(makeBins(maxAmount, extent, interval));
	const binColors = _.map(
		bins,
		(bin, index) => colorNames[index % colorNames.length]
	);

	saveExportedObj(binsPath)(bins)
	.then(tapMessage(`Saved bins at: ${binsPath}`))

	saveExportedObj(colorsPath)(binColors)
	.then(tapMessage(`Saved bins color at: ${colorsPath}`));
}

makeRandomBins(20, [0, 20], 2, BINS_PATH_1, BINS_COLOR_PATH_1);
makeRandomBins(10, [-1, 1.2], 0.12, BINS_PATH_2, BINS_COLOR_PATH_2);
makeRandomBins(1e3, [10, 20], 1, BINS_PATH_3, BINS_COLOR_PATH_3);
