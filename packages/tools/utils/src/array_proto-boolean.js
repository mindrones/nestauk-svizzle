/**
* @module @svizzle/utils/array_proto-boolean
*/

import * as _ from "lamb";

/**
 * Return an function expecting a value and returning true if it is included in the provided array
 * @see [Array.prototype.includes]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes}
 *
 * @function
 * @arg {array} array
 * @arg {*} any
 * @return {boolean}
 *
 * @example includes([0, 1, 2], 2) // true
 * @example includes([0, 1, 2], 3) // false
 *
 * @version 0.3.0
 */
export const includes = _.generic(Array.prototype.includes);
