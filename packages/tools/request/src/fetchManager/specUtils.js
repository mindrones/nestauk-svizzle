import {createReadStream} from 'node:fs';
import http from 'node:http';

import {readExportedJson} from '@svizzle/file';
import * as _ from 'lamb';
import serveHandler from 'serve-handler';
import Throttle from 'throttle';

export const loadExportedJsons = async (basePath, keys, filesMap) => {
	const fileLoadingPromises = _.pipe([
		_.pairs,
		_.filterWith(([key]) => keys.includes(key)),
		_.mapWith(([key, fileName]) =>
			[key, `${basePath}/${fileName}`]
		),
		_.mapWith(
			async ([key, filePath]) => [key, await readExportedJson(filePath)]
		)
	])(filesMap);

	const loadedFiles = await Promise.all(fileLoadingPromises);
	return _.fromPairs(loadedFiles);
}

export const getFileNamesMap = _.pipe([
	_.filterWith(fileName => fileName.endsWith('.js')),
	_.filterWith(fileName => (/.*\d\.js$/u).test(fileName)),
	_.mapWith(fileName => [
		`NUTS-${fileName.substr(12,4)}-${fileName.substr(27,1)}-${fileName.substr(8,2)}`,
		fileName
	]),
	_.fromPairs
]);

export const makeUriMap = baseUri => _.pipe([
	_.pairs,
	_.mapWith(([key, fileName]) => [
		key,
		{url: baseUri + fileName}
	]),
	_.fromPairs
]);

export const getKeysNamed = string =>
	_.filterWith(key => key.includes(string));

export const startServer = ({bandwidth, port, basePath}) => {
	let middleware;

	if (bandwidth) {
		middleware = {
			createReadStream (filePath, config) {
				const throttledStream = new Throttle({bps: bandwidth});
				createReadStream(filePath, config).pipe(throttledStream);
				return throttledStream;
			}
		}
	}

	const server = http.createServer(async (req, res) => {
		await serveHandler(
			req,
			res,
			{public: basePath},
			middleware
		);
	});
	server.listen(port);

	return server;
}
