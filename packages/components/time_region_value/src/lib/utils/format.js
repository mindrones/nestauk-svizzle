import * as _ from 'lamb';
import {format} from 'd3-format';
import {isKeyValue, sliceStringAt} from '@svizzle/utils';

const getIdentity = () => _.identity;

export const makeGetIndicatorFormatOf = id => _.pipe([
	_.getPath(`${id}.schema.value`),
	_.adapter([
		_.casus(_.isNil, getIdentity),
		_.casus(
			_.allOf([
				isKeyValue(['data_type', 'int']),
				_.hasKey('format'),
			]),
			value => _.pipe([
				Math.round,
				format(value.format)
			])
		),
		_.casus(
			_.allOf([
				isKeyValue(['data_type', 'int']),
				_.not(_.hasKey('format')),
			]),
			() => Math.round
		),
		_.casus(
			_.hasKey('format'),
			value => format(value.format)
		),
		getIdentity,
	]),
]);

export const makeGetRefFormatOf = id => _.pipe([
	_.getPath(`${id}.schema.value`),
	_.adapter([
		_.casus(_.isNil, getIdentity),
		_.casus(
			_.allOf([
				isKeyValue(['data_type', 'int']),
				_.hasKey('format'),
			]),
			value => _.pipe([
				Math.round,
				format(value.format)
			])
		),
		_.casus(
			isKeyValue(['data_type', 'int']),
			() => Math.round
		),
		_.casus(
			_.hasKey('format'),
			value => format(value.format)
		),
		getIdentity,
	])
]);

export const shortenYear = _.pipe([String, sliceStringAt([2, 4])]);
