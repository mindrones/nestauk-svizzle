/**
* @module @svizzle/utils/array/number
*/

import * as _ from "lamb";

/* random */

/**
 * Return a random number in the specified range.
 *
 * @function
 * @arg {array} range
 * @return {number}
 *
 * @example
 * makeRandomNumInRange(1.2, 7.4) // 4.2
 *
 * @version 0.1.0
 */
export const makeRandomNumInRange = ([min, max]) =>
    min + (max - min) * Math.random();

/* max */

/**
 * Return the max of the numbers in the provided array
 *
 * @function
 * @arg {array} array
 * @return {number} max
 *
 * @example arrayMax([-1, -2, 0, 1, 2]) // 2
 *
 * @version 0.1.0
 */
export const arrayMax = _.apply(Math.max);

/* min */

/**
 * Return the min of the numbers in the provided array
 *
 * @function
 * @arg {array} array
 * @return {number} min
 *
 * @example arrayMin([-1, -2, 0, 1, 2]) // -2
 *
 * @version 0.1.0
 */
export const arrayMin = _.apply(Math.min);