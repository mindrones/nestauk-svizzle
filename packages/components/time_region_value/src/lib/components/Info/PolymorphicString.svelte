<script>
	import {isArray, isObject} from '@svizzle/utils';
	import {pairs} from 'lamb';

	export let item = null;
	export let title = null;
</script>

<div>
	{#if isObject(item)}
		<p><b>{title}:</b></p>
		<ul>
			{#each pairs(item) as [key, value]}
				{#if isArray(value)}
					<li>{key}:
						<ul>
							{#each value as string}
								<li><span>{string}</span></li>
							{/each}
						</ul>
					</li>
				{:else}
					<li><span>{value}</span></li>
				{/if}
			{/each}
		</ul>
	{:else if isArray(item)}
		<p><b>{title}:</b></p>
		<ul>
			{#each item as string}
				<li><span>{string}</span></li>
			{/each}
		</ul>
	{:else}
		<p><b>{title}:</b> {item}</p>
	{/if}
</div>

<style>
	b {
		margin-right: 0.25rem;
	}

	ul {
		margin-left: 1.5rem;
	}
</style>
