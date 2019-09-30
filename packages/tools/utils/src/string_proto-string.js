/**
* @module @svizzle/utils/string_proto-string
*/

import * as _ from "lamb";

/**
 * Return a string by trimming white space of the provided string
 *
 * @function
 * @arg {string} string
 * @return {string}
 *
 * @example
 * trim("   abc   \n  ") // "abc"
 *
 * @version 0.1.0
 */
export const trim = _.generic(String.prototype.trim);
