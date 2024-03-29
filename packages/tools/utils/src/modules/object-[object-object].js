/**
* @module @svizzle/utils/object-[object-object]
*/

import * as _ from 'lamb';

import {applyFnMap} from './object-[any-object].js';

/**
 * Return a function that applies the provided map to the expected object and merges the result to the object.
 * This is useful to add new properties to an object, eventually modifying existing ones by using keys expected to be in the input objects.
 *
 * @function
 * @arg {object} fnMap - a map key/function Any -> Any (applied to the object)
 * @return {function} - Object -> Object
 *
 * @example
> enhancer = makeMergeAppliedFnMap({
	coords: _.collect([_.getKey('lng'), _.getKey('lat')]),
	fullname: _.pipe([
		_.collect([_.getKey('fname'), _.getKey('lname')]),
		_.joinWith(' ')
	]),
	lat: obj => roundTo2(obj.lat),
	lng: obj => roundTo2(obj.lng),
})
> enhancer({
	fname: 'John',
	lat: 2.345434,
	lname: 'Woo',
	lng: 10.3425,
})
{
	coords: [10.3425, 2.345434],
	fname: 'John',
	fullname: 'John Woo',
	lat: 2.35,
	lname: 'Woo',
	lng: 10.34,
}
 *
 * @since 0.9.0
 * @see {@link module:@svizzle/utils/object-[any-object].applyFnMap|applyFnMap}
 * @see {@link module:@svizzle/utils/array-[object-object].applyTransformsSequence|applyTransformsSequence}
 * @see {@link module:@svizzle/utils/object-[object-object].transformPaths|transformPaths}
 * @see {@link module:@svizzle/utils/object-[object-object].transformValues|transformValues}
 */
export const makeMergeAppliedFnMap = fnMap => {
	const makeProps = applyFnMap(fnMap);

	return obj => _.merge(obj, makeProps(obj));
}

/**
 * Return a function that expects an object and applies the functions in the values of the input object to the values of the provided object found in the paths in the correspondent keys.
 * Note that since the provided transforms is an object, paths can be processed only once.
 * However, providing a transform that makes another transform meaningless can generate errors because internally the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#Description|for..in statement} is used to list transforms: because the order of iteration is implementation-dependent, the order of the execution could be unpredictable on old browsers.
 * To apply a specific sequence of transforms, including those modifying the same path multiple times, please see {@link module:@svizzle/utils/array-[object-object].applyTransformsSequence|applyTransformsSequence}.
 *
 * @function
 * @arg {object} pathToFn - object with paths as keys and functions as values
 * @return {function} - Object -> Object
 *
 * @example
> transform = transformPaths({
   'a.a2.a22': _.pipe([Number, Math.sqrt]),
   'a.a3': parseInt,
   'b.b2': parseInt,
 })
> transform({
	a: {
		a1: 'a1',
		a2: {
			a21: 'a21',
			a22: '9',
		},
		a3: '3px',
		a4: '2',
	},
	b: {
		b1: 'b1',
		b2: '4px'
	},
})
{
	a: {
		a1: 'a1',
		a2: {
			a21: 'a21',
			a22: 3,
		},
		a3: 3,
		a4: '2',
	},
	b: {
		b1: 'b1',
		b2: 4
	},
}
> dangerousTransform = transformPaths({
	'a': _.values,     // assuming we have an object in `a`...
	'a.0': x => 2 * x  // ...if this runs first, it could return `2 * undefined = NaN`
 });
 *
 * @since 0.6.0
 * @see {@link module:@svizzle/utils/array-[object-object].applyTransformsSequence|applyTransformsSequence}
 * @see {@link module:@svizzle/utils/object-[any-object].applyFnMap|applyFnMap}
 * @see {@link module:@svizzle/utils/object-[object-object].makeMergeAppliedFnMap|makeMergeAppliedFnMap}
 * @see {@link module:@svizzle/utils/object-[object-object].transformValues|transformValues}
 */
export const transformPaths = pathToFn => obj =>
	_.reduce(_.pairs(pathToFn), (acc, [path, fn]) => {
		const value = _.getPathIn(acc, path);

		return _.setPathIn(acc, path, _.application(fn, [value]));
	}, _.merge({}, obj));

/**
 * Return a function that expects an object and applies the functions in the values of the input object to the correspondent values of the provided object.
 * Can be useful with [d3.csvParse]{@link https://github.com/d3/d3-dsv#csvParse}, see the example below.
 * Since 0.6.0 it assumes identity for missing keys.
 *
 * @function
 * @arg {object} fnMap - object with functions as values
 * @return {function} - Object -> Object
 *
 * @example
> conversionFn = transformValues({
	name: _.identity,
	a: _.pipe([Number, Math.sqrt]),
	b: Number,
	width: parseFloat
})
> conversionFn({name: 'foo', a: '9', b: '2', width: '10px'})
{name: 'foo', a: 3, b: 2, width: 10}

$ cat baseurl/file.csv
name,a,b,width
foo,9,2,10px
bar,4,4,25px

> d3.csvParse('baseurl/file.csv', conversionFn)
[{name: 'foo', a: 3, b: 2, width: 10}, {name: 'bar', a: 2, b: 4, width: 25}]

> conversionFn = transformValues({
	a: _.pipe([Number, Math.sqrt]),
})
> conversionFn({name: 'foo', a: '9', b: '2', width: '10px'})
{name: 'foo', a: 3, b: '2', width: '10px'}
 *
 * @since 0.1.0
 * @see {@link module:@svizzle/utils/array-[object-object].applyTransformsSequence|applyTransformsSequence}
 * @see {@link module:@svizzle/utils/object-[any-object].applyFnMap|applyFnMap}
 * @see {@link module:@svizzle/utils/object-[object-object].makeMergeAppliedFnMap|makeMergeAppliedFnMap}
 * @see {@link module:@svizzle/utils/object-[object-object].transformPaths|transformPaths}
 */
export const transformValues = fnMap => _.mapValuesWith(
	(value, key) => key in fnMap
		? _.application(fnMap[key], [value])
		: value
);

/**
 * Return a function that expects an object and applies the provided updater
 * function to the values correspondent to the provided keys, leaving the other
 * properties unchanged.
 *
 * @function
 * @arg {object} - {keys: Array, updater: Any -> Any}
 * @return {function} - Object -> Object
 *
 * @example
> update = updateKeys({
	keys: ['a', 'k', 'm'],
	updater: x => x * 2
});
> update({a: 1, b: 2, d: 4, k: 7, m: 2})
{a: 2, b: 2, d: 4, k: 14, m: 4}
> update({a: 1, b: 2, d: 4})
{a: 2, b: 2, d: 4}
> update({b: 2, d: 4})
{b: 2, d: 4}
 *
 * @since 0.16.0
 */
export const updateKeys = ({keys, updater}) => obj =>
	_.reduce(keys, (acc, key) => {
		if (key in acc) {
			acc[key] = updater(acc[key])
		}

		return acc;
	}, {...obj});

/**
 * Return a function expecting an object to merge with the input object
 *
 * @function
 * @arg {object} object - Object to be merged to the provided object
 * @return {function} - Object -> Object
 *
 * @example
> mergeB = mergeObj({b: 2})
> mergeB({a: 1})
{a: 1, b: 2}
> mergeB({a: 1, b: 1})
{a: 1, b: 2}
 *
 * @since 0.1.0
 */
export const mergeObj = obj => _.partial(_.merge, [_.__, obj]);

/**
 * Return a function that merges the provided value on the provided key of the expected object
 *
 * @function
 * @arg {string} key - Key where to merge the Value
 * @arg {object} object - Value to be merged
 * @return {function} - Object -> Object
 *
 * @example

> mergeFooValue = makeMergeKeyValue('foo', {b: -2, c: -3})
> mergeFooValue({
	foo: {a: 1, b: 2},
	bar: {k: 1}
})
{
	foo: {a: 1, b: -2, c: -3},
	bar: {k: 1}
}
> mergeFooValue({
	bar: {k: 1}
})
{
	foo: {b: -2, c: -3},
	bar: {k: 1}
}
 *
 * @since 0.1.0
 */
export const makeMergeKeyValue = (key, value) => object =>
	_.merge(object, {
		[key]: object[key]
			? _.merge(object[key], value)
			: value
	});
