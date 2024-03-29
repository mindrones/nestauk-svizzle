/**
* @module @svizzle/utils/string-string
*/

import * as _ from 'lamb';

import {sliceString} from './string_proto-string.js';
import {endsWithNewLine} from './string-boolean.js';
import {getEndOfLineLength} from './string-number.js';

/**
 * Capitalise the input string
 *
 * @function
 * @arg {string}
 * @return {string}
 *
 * @example
> capitalize('hello')
'Hello'
 *
 * @since 0.8.0
 */
export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Decapitalise the input string (makes the first letter lowercase)
 *
 * @function
 * @arg {string}
 * @return {string}
 *
 * @example
> decapitalize('Hello')
'hello'
> decapitalize('HELLO')
'hELLO'
 *
 * @since 0.20.0
 */
export const decapitalize = s => s.charAt(0).toLowerCase() + s.slice(1);


/**
 * Trim the last char of the provided string if it's a newline
 *
 * @function
 * @arg {string} string
 * @return {array}
 *
 * @example
> trimLastNewline('a\nb\nc')
'a\nb\nc'
> trimLastNewline('a\nb\nc\n')
'a\nb\nc'
> trimLastNewline('a\nb\nc\n\n')
'a\nb\nc\n'
> trimLastNewline('a\nb\nc\r\n')
'a\nb\nc'
> trimLastNewline('a\nb\nc\n\r\n')
'a\nb\nc\n'
 *
 * @since 0.5.0
 */
export const trimLastNewline =
	_.when(endsWithNewLine, s => {
		const L = getEndOfLineLength(s);

		return sliceString(s, 0, -L);
	});
