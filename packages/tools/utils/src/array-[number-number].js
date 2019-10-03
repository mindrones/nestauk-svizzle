/**
* @module @svizzle/utils/array-[number-number]
*/

import * as _ from "lamb";
import {reduceFromEmptyArray} from "./function-[array-any]";

/**
 * Return a function that computes the polynomial of the input number using the provided cofficients.
 *
 * @function
 * @arg {array} cofficients - Array of cofficients, the exponent corresponding to the their index
 * @return {function} - Number -> Number
 *
 * @example
const poly = makePolynomial([0,2,0,4]) // x => 2 x + 4 x^3
poly(2) // 36
poly(5) // 510
 *
 * @version 0.3.0
 */
export const makePolynomial = _.pipe([
  reduceFromEmptyArray((acc, coefficient, exponent) => {
    if (coefficient) {
      acc.push(x => coefficient * Math.pow(x, exponent))
    }
    return acc;
  }),
  terms => _.pipe([
    _.collect(terms),
    _.reduceWith(_.sum)
  ])
]);
