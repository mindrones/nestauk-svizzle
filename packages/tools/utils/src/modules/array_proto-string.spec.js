import {strict as assert} from 'node:assert';

import {join} from './array_proto-string.js';

const arr = [0, 1, 2];

describe('(prototype) Array -> String', function () {
	describe('join', function () {
		it('should join an array with commas (default behaviour)', function () {
			assert.deepStrictEqual(join(arr), '0,1,2');
		});
	});
});
