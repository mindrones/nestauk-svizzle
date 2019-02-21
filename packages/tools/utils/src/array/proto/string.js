/**
* @module @svizzle/utils/array/proto/string
*/

import * as _ from "lamb";

/**
 * Return an string by joining the provided array with the provided separator
 *
 * @function
 * @arg {array} array
 * @arg {string} separator
 * @return {string}
 *
 * @example join([0, 1, 2], "-") // "0-1-2"
 *
 * @version 0.1.0
 */
export const join = _.generic(Array.prototype.join);
