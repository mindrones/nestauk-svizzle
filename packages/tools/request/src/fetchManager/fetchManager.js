import {
	isKeyValue,
	objectToKeyValueArray
} from '@svizzle/utils';
import * as _ from 'lamb';
import {
	BehaviorSubject,
	from,
	Subject
} from 'rxjs';
import {
	zipWith,
	debounceTime,
	filter,
	map,
	share,
	skipWhile,
	switchMapTo,
	withLatestFrom
} from 'rxjs/operators';

import {derive} from './rxUtils.js';
import {makeSideEffectors} from './sideEffects.js';

export const createFetchManagerStreams = downloadFn => {

	/* input streams */

	const _asapKeys = new BehaviorSubject([]);
	const _nextKeys = new BehaviorSubject([]);
	const _shouldPrefetch = new BehaviorSubject(false);
	const _uriMap = new BehaviorSubject({});

	/* output streams */

	const _outData = new BehaviorSubject({});
	const _outEvents = new Subject();
	const _outLoadingKeys = new BehaviorSubject([]);

	/* internal streams */

	const _groupIds = from(['asap', 'next', 'rest']);
	const _startNextGroup = new BehaviorSubject();
	const _runChain = new BehaviorSubject();

	/* internal derived streams */

	const _allKeys = _uriMap.pipe(
		map(_.keys),
		share()
	);

	const _restKeys = derive(
		[_allKeys, _asapKeys, _nextKeys, _runChain],
		([allKeys, asapKeys, nextKeys]) =>
			_.difference(allKeys, _.union(asapKeys, nextKeys))
	);

	const _groups = _restKeys.pipe(
		withLatestFrom(_asapKeys, _nextKeys),
		map(([restKeys, asapKeys, nextKeys]) => ({
			asap: asapKeys,
			next: nextKeys,
			rest: restKeys
		}))
	);

	const _targetGroupId = _groups.pipe(
		debounceTime(0),
		switchMapTo(
			_groupIds.pipe(
				zipWith(_startNextGroup), // wait for download to complete
				map(_.head),
			)
		),
		share(),
	);

	// Keys of files that are fully fetched
	const _fetchedKeys = _outData.pipe(
		map(_.keys),
		share()
	);

	// Keys in target group that are not yet fully fetched
	// Some of them might be currently downloading
	const _fetchingOrUnfetchedTargetKeys = _targetGroupId.pipe(
		withLatestFrom(_groups, _shouldPrefetch, _fetchedKeys),
		map(([targetGroupId, groups, shouldPrefetch, fetchedKeys]) =>
			shouldPrefetch || targetGroupId === 'asap'
				? _.difference(groups[targetGroupId], fetchedKeys)
				: []
		),
		share()
	);

	const _fetchingOrFetchedTargetKeys = _targetGroupId.pipe(
		withLatestFrom(_groups, _fetchedKeys, _outLoadingKeys),
		map(([targetGroupId, groups, fetchedKeys, loadingKeys]) =>
			_.intersection(
				groups[targetGroupId],
				_.union(fetchedKeys, loadingKeys)
			)
		),
		share()
	);

	// keys in target group that have not started downloading
	const _unfetchedTargetKeys = _fetchingOrUnfetchedTargetKeys.pipe(
		withLatestFrom(_outLoadingKeys),
		map(([fetchingOrUnfetchedTargetKeys, outLoadingKeys]) =>
			_.difference(
				fetchingOrUnfetchedTargetKeys,
				outLoadingKeys
			)
		),
	);

	const _unfetchedUris = _unfetchedTargetKeys.pipe(
		withLatestFrom(_uriMap),
		map(([unfetchedTargetKeys, uriMap]) =>
			objectToKeyValueArray(_.pickIn(uriMap, unfetchedTargetKeys))
		)
	);

	// If asapKeys changes cancel all current downloads, except those in asap
	const _cancelKeys = _asapKeys.pipe(
		debounceTime(0),
		// use `withLatestFrom` instead of `combineLatestWith` (in `derive`) so
		// that it is not recomputed more than needed.
		withLatestFrom(_outLoadingKeys),
		map(([asapKeys, outLoadingKeys]) =>
			_.difference(outLoadingKeys, asapKeys)
		)
	);

	/* subscripted updates */

	// restart the chain when `_shouldPrefetch` changes
	_shouldPrefetch.subscribe(
		should => should && _runChain.next()
	);

	/* side effects */

	const {
		cancel,
		startDownload
	} = makeSideEffectors({
		_outEvents,
		downloadFn
	});

	// cancelling

	const cancelAll = reason =>
		_outLoadingKeys
		.getValue()
		.forEach(key => cancel(key, reason));

	// When `_uriMap` changes we:
	// * cancel all downloads
	// * wipe `_outData` (clear the cache)
	_uriMap
	.pipe(debounceTime(0))
	.subscribe(() => {
		cancelAll('Cancelled by uriMap change');
		_outData.next({});
		_outEvents.next({type: 'reset'});
	});

	_cancelKeys
	.pipe(debounceTime(0))
	.subscribe(cancelKeys =>
		cancelKeys.forEach(key => cancel(key, 'Cancelled by priority change'))
	);

	_outEvents
	.pipe(
		filter(isKeyValue(['type', 'file:start'])),
		withLatestFrom(_outLoadingKeys)
	)
	.subscribe(([{key}, loadingUris]) =>
		_outLoadingKeys.next([...loadingUris, key])
	);

	_outEvents
	.pipe(
		filter(
			({type}) => [
				'file:cancel',
				'file:complete',
				'file:error'
			].includes(type)
		),
		withLatestFrom(_outLoadingKeys, _outData),
	)
	.subscribe(([{data, key, type}, loadingKeys, outData]) => {
		_outLoadingKeys.next(_.pullFrom(loadingKeys, [key]));

		if (type === 'file:complete') {
			_outData.next({...outData, [key]: data});
		}
	});

	_outEvents
	.pipe(
		filter(isKeyValue(['type', 'group:complete'])),
		withLatestFrom(_outLoadingKeys)
	)
	.subscribe(() => _startNextGroup.next());

	// downloading

	_unfetchedUris
	.pipe(
		zipWith(_targetGroupId),
		withLatestFrom(_fetchingOrFetchedTargetKeys),
	)
	.subscribe(startDownload);

	// FIXME this happens on every completed download and is rather abusive of
	// memory allocation and the garbage collector. Should rewrite conditional
	// without creating new arrays.
	_fetchedKeys
	.pipe(
		withLatestFrom(_allKeys, _asapKeys, _shouldPrefetch),
		skipWhile(
			([fetchedUris, allKeys, asapKeys, shouldPrefetch]) =>
				_.intersection(
					shouldPrefetch ? allKeys : asapKeys,
					fetchedUris
				).length < (shouldPrefetch ? allKeys : asapKeys).length
		),
		debounceTime(0)
	)
	.subscribe(() => _outEvents.next({type: 'done'}));

	return {
		_asapKeys,
		_nextKeys,
		_outData,
		_outEvents,
		_outLoadingKeys,
		_shouldPrefetch,
		_uriMap,
	}
}
