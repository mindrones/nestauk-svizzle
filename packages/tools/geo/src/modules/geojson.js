/**
* @module @svizzle/geo/geojson
*/

import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import {featureCollection} from '@turf/helpers';
import truncate from '@turf/truncate';
import * as _ from 'lamb';

/**
 * Return or create the {@link https://tools.ietf.org/html/rfc7946#section-5|bbox} of the provided geojson
 *
 * @function
 * @arg {object} geojson - Geojson object
 * @return {array}
 *
 * @example
> getOrMakeBBox({
	type: 'FeatureCollection',
	features: [{
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[1, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]]
			]
		}
	}, {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[2, -1], [2, 1], [0, 1], [0, -1], [2, -1]]
			]
		}
	}]
})
[-1, -1, 2, 1]

> // no calculation involved here
> getOrMakeBBox({
	type: 'FeatureCollection',
	bbox: [-10.0, -10.0, 10.0, 10.0],
	geometry: {
	type: 'Polygon',
	coordinates: [
		[
			[-10.0, -10.0],
			[10.0, -10.0],
			[10.0, 10.0],
			[-10.0, -10.0]
		]
	]
	}
})
[-10.0, -10.0, 10.0, 10.0]
 * @since 0.1.0
 */
export const getOrMakeBBox = json => json.bbox ? json.bbox : bbox(json);

/**
 * Return a function expecting a geojson and creating or updating the provided property of all features using the provided map.
 * Note that you can pass a `key or an alternative key `key_alt` e.g. when you use ISO Alpha 2 codes and you need to identify unrecognized territories with another key.
 *
 * @function
 * @arg {object} args - Geojson object
 * @arg {string} args.key_alt - Alternative key to be found in properties in `key` is not found.
 * @arg {string} args.key - Key to be found in properties
 * @arg {object} args.map - Mapping key (string) -> string
 * @arg {function} args.mapFn - Function key (string) -> string
 * @arg {string} args.propName - Name of the property to be added to `properties`
 * @return {function} - Object -> Object
 *
 * @example
> geojson = {
	type: 'FeatureCollection',
	features: [{
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[1, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]]
			]
		},
		properties: {iso_a2: 'BF'}
	}, {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[2, -1], [2, 1], [0, 1], [0, -1], [2, -1]]
			]
		},
		properties: {name: 'Kosovo'}
	}, {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[4, -1], [2, 7], [0, 5], [0, -4], [4, -1]]
			]
		},
		properties: {iso_a2: 'FR'}
	}]
}
> keyToColor = {BF: 'red', Kosovo: 'yellow'}
> addColor = makeAddFeaturesProperty({
	propName: 'color',
	map: keyToColor,
	key: 'iso_a2',
	key_alt: 'name'
})
> coloredFeatures = addColor(geojson)
{
	type: 'FeatureCollection',
	features: [{
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[1, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]]
			]
		},
		properties: {iso_a2: 'BF', color: 'red'}
	}, {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[2, -1], [2, 1], [0, 1], [0, -1], [2, -1]]
			]
		},
		properties: {name: 'Kosovo', color: 'yellow'}
	}, {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[[4, -1], [2, 7], [0, 5], [0, -4], [4, -1]]
			]
		},
		properties: {iso_a2: 'FR', color: undefined}
	}]
}
 * @since 0.5.0
 */
export const makeUpdateFeaturesProperty = ({
	key_alt,
	key,
	map,
	mapFn,
	propName,
}) =>
	_.updateKey('features', _.mapWith(
		_.updateKey('properties', properties => {
			let propValue;

			if (map) {
				propValue = _.has(map, properties[key])
					? map[properties[key]]
					: _.has(map, properties[key_alt])
						? map[properties[key_alt]]
						: undefined
			} else if (mapFn) {
				propValue = properties[key]
					? mapFn(properties[key])
					: properties[key_alt]
						? mapFn(properties[key_alt])
						: undefined
			}

			return {
				...properties,
				[propName]: propValue
			}
		})
	));

/**
 * Return the a collection of centroids of the provided features, each having the correspondent feature properties.
 *
 * @function
 * @arg {array} features - Array of features
 * @return {object} collection - FeatureCollection of Point features
 *
 * @example
> makeCentroids([
	{
		type: 'Feature',
		properties: {foo: 'a'},
		geometry: {type: 'LineString', coordinates: [
			[[1, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]]
		]}
	},
	{
		type: 'Feature',
		properties: {foo: 'b'},
		geometry: {type: 'LineString', coordinates: [
			[[2, -1], [2, 1], [0, 1], [0, -1], [2, -1]]
		]}
	}
])
{
	type: 'FeatureCollection',
	features: [{
		type: 'Feature',
		geometry: {type: 'Point', coordinates: [0.2, -0.2]},
		properties: {foo: 'a'}
	}, {
		type: 'Feature',
		geometry: {type: 'Point', coordinates: [1.2, -0.2]},
		properties: {foo: 'b'}
	}]
}
 * @since 0.1.0
 */
export const makeCentroids = _.pipe([
	_.mapWith(feature => centroid(feature, {properties: feature.properties})),
	featureCollection
]);

/**
 * Return a function expecting an object and returning it as a Point feature.
 * You can define a coordPicker using {@link makeKeysGetter}:
 * const getCoordinates = makeKeysGetter(['lng', 'lat'])
 *
 * @function
 * @arg {function} coordPicker - The function to create the point coordinates ([longitude, latitude]) from the provided feature
 * @arg {function} propsTransformer - The function to create the properties of the resulting point from the provided feature
 * @return {object} point - Geojson Point feature.
 *
 * @example
> coordPicker = _.collect([_.getKey('lng'), _.getKey('lat')])
> toPointFeature = makeToPointFeature(coordPicker)
> toPointFeature({foo: 'a', lng: 0.1, lat: 0.1})
{
	type: 'Feature',
	geometry: {type: 'Point', coordinates: [0.1, 0.1]},
	properties: {foo: 'a', lng: 0.1, lat: 0.1}
}

> const propsTransformer = applyFnMap({name: _.getKey('foo')})
> const toPointFeature = makeToPointFeature(coordPicker, propsTransformer)
> toPointFeature({foo: 'a', lng: 0.1, lat: 0.1})
{
	type: 'Feature',
	geometry: {type: 'Point', coordinates: [0.1, 0.1]},
	properties: {name: 'a'}
}
 * @since 0.1.0
 */
export const makeToPointFeature = (coordPicker, propsTransformer = null) =>
	object => ({
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: coordPicker(object)
		},
		properties: propsTransformer ? propsTransformer(object) : object
	});

/**
 * Return a function expecting an array of objects and returning them as a FeatureCollection of Point features.
 * You can define a coordPicker using {@link makeKeysGetter}:
 * const getCoordinates = makeKeysGetter(['lng', 'lat'])
 *
 * @function
 * @arg {function} coordPicker - The function to create the point coordinates ([longitude, latitude]) from the provided features
 * @arg {function} propsTransformer - The function to create the properties of the resulting points from the provided features
 * @return {object} collection - FeatureCollection of Point features
 *
 * @example
> coordPicker = _.collect([_.getKey('lng'), _.getKey('lat')])
> toGeoPoints = makeToGeoPoints(coordPicker)
> toGeoPoints([
	{foo: 'a', lng: 0.1, lat: 0.1},
	{foo: 'b', lng: 0.2, lat: 0.2}
])
{
	type: 'FeatureCollection',
	features: [{
		type: 'Feature',
		geometry: {type: 'Point', coordinates: [0.1, 0.1]},
		properties: {foo: 'a', lng: 0.1, lat: 0.1}
	}, {
		type: 'Feature',
		geometry: {type: 'Point', coordinates: [0.2, 0.2]},
		properties: {foo: 'b', lng: 0.2, lat: 0.2}
	}]
}

> propsTransformer = applyFnMap({name: _.getKey('foo')})
> toGeoPoints = makeToGeoPoints(coordPicker, propsTransformer)
> toGeoPoints([
	{foo: 'a', lng: 0.1, lat: 0.1},
	{foo: 'b', lng: 0.2, lat: 0.2}
])
{
	type: 'FeatureCollection',
	features: [{
		type: 'Feature',
		geometry: {type: 'Point', coordinates: [0.1, 0.1]},
		properties: {name: 'a'}
	}, {
		type: 'Feature',
		geometry: {type: 'Point', coordinates: [0.2, 0.2]},
		properties: {name: 'b'}
	}]
}
 * @since 0.1.0
 */
export const makeToGeoPoints = (coordPicker, propsTransformer) => _.pipe([
	_.mapWith(makeToPointFeature(coordPicker, propsTransformer)),
	featureCollection
]);

// TODO use a reduce to include only items with lat/lng as defined by coordPicker

/**
 * Return a function returning a copy of the provided geojson having the geometry coordinates rounded to the given precision.
 *
 * @function
 * @arg {number} precision - coordinate decimal precision
 * @return {function} - Geojson -> Geojson
 *
 * @example
> truncateGeometry = setGeometryPrecision(4)
> point = {
	type: 'Feature',
	geometry: {type: 'Point', coordinates: [0.1234567, 0.12341]},
	properties: {name: 'a'}
}
> truncateGeometry(point)
{
	type: 'Feature',
	geometry: {type: 'Point', coordinates: [0.1234, 0.1234]},
	properties: {name: 'a'}
}
 * @since 0.1.0
 */
export const setGeometryPrecision = precision =>
	geojson => truncate(geojson, {precision, mutate: false});

// convenience function
export const truncateGeojson = setGeometryPrecision(4);

// TODO DOC: define FeatureCollection type
