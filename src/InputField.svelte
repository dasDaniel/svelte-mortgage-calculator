<script>
	// ENUMS
	const TYPE_DOLLAR = 'dollar';
	const TYPE_PERCENT = 'percent';
	const TYPE_YEAR = 'years';
	const TYPE_OPTIONS = 'option';

	// PROPS
	export let value = 0;
	export let placeholder = '';
	export let type = '';
	export let decimals = '';
	export let step = '';
	export let options = [];

</script>

<div class="wrapper">
	{#if type !== TYPE_OPTIONS}
	{#if type === TYPE_DOLLAR}<span>$</span>{/if}
	<input placeholder="{placeholder}" bind:value={value}>
	{#if type === TYPE_PERCENT}<span>%</span>{/if}
	{#if type === TYPE_YEAR}<span>Years</span>{/if}
	{:else}
	<select bind:value={value}>
		{#each options as option}
		<option value={option.value}>{option.title}</option>
		{/each}
	</select>
	{/if}
</div>

<style>
	.wrapper{
		width: 35%;
		display: flex;
	}
	input, select {
		display: inline-block;
		box-sizing: content-box;
		width: 100%;
		font-size: 18px;
		padding: 6px 8px 2px 2px;
		border: none;
		border-bottom: 3px solid #d9e3f0;
		background: none;
		outline: none;
		border-radius: 2px 2px 0 0;
		color: #263238;
	}
	input:active, input:focus, select:active, select:focus {
		background: #ebf0f7;
	}
	select option {
		background: #ffffff;
	}
	select option:active, select option:hover, select option:focus {
		background: #d9e3f0;
	}
</style>