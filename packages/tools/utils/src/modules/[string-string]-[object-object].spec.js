import {strict as assert} from 'node:assert';

import {makePrefixed} from './string-[string-string].js';
import {renameKeysWith} from './[string-string]-[object-object].js';

describe('(String -> String) -> (Object -> Object)', function () {
	describe('renameKeysWith', function () {
		it('should return a function expecting an object and returning a new object with keys renamed with the provided function', function () {
			const rename = renameKeysWith(makePrefixed('--'));

			assert.deepStrictEqual(
				rename({foo: 1, bar: 2, 'another-var': 3}),
				{'--foo': 1, '--bar': 2, '--another-var': 3}
			);
		});
	});
});
