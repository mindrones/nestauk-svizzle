<script context='module'>
	let dbFactories;
	let bind;
</script>

<script>
	import {areEqual} from '@svizzle/utils';
	import {onMount} from 'svelte';
	import {writable} from 'svelte/store';

	import {isClientSide} from '../../utils/env.js';

	export let _store = writable();
	export let defaultValue = null;
	export let isReactive = false;
	export let key = null;
	export let type = 'noop';

	let isLoaded = false;
	let unbind;

	onMount(async () => {
		const {
			createCookieStorage,
			createIndexedDBStorage,
			createLocalStorage,
			createNoopStorage,
			createSessionStorage,
		} = await import('@macfja/svelte-persistent-store');

		if (!dbFactories) {
			dbFactories = {
				cookie: () => createCookieStorage(),
				indexedDB: () => createIndexedDBStorage(),
				localStorage: pIsReactive => createLocalStorage(pIsReactive),
				noop: () => createNoopStorage(),
				sessionStorage: pIsReactive => createSessionStorage(pIsReactive),
			};
		}

		if (!bind) {
			bind = ({
				_store: _store_,
				defaultValue: defaultValue_,
				isReactive: isReactive_,
				key: key_,
				type: type_
			}) => {
				const database = dbFactories[type_](isReactive_);
				const initialValue = database.getValue(key_) || defaultValue_;
				_store_.set(initialValue);

				const syncStore = () => {
					const currentValue = database.getValue(key_) || defaultValue_;
					_store_.set(currentValue);
				};
				const updateDb = newValue => {
					if (areEqual([defaultValue_, newValue])) {
						database.deleteValue(key_);
					} else {
						database.setValue(key_, newValue);
					}
				}

				// When we update the store, we also update the database
				_store_.subscribe(updateDb);

				// When the database changes, we sync the store
				// e.g. you can edit `localStorage` in dev tools and expect the UI to
				// update because it's bound to the store.
				database.addListener?.(key_, syncStore);

				return () => {
					database.removeListener?.(key_, syncStore);
				};
			};

		}
		isLoaded = true;
	});

	$: if (isLoaded && !(type in dbFactories)) {
		type = 'noop';
	}
	$: if (isLoaded && isClientSide && key && type && _store) {
		unbind?.();
		unbind = bind({_store, defaultValue, isReactive, key, type});
	}
</script>
