import * as _ from 'lamb';
import {
	indexValuesWith,
	pluckKeys,
	objectToKeyValueArray
} from '@svizzle/utils';

import * as examples from './_examples';

const makeLookup = indexValuesWith(_.getKey('slug'));
export const lookup = makeLookup(examples);

const makeSidebar = _.pipe([
	_.mapValuesWith(pluckKeys(['slug', 'title'])),
	objectToKeyValueArray,
]);
export const sidebar = makeSidebar(examples);
