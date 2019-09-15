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
	export let decimals = 0;
	export let step = '';
	export let options = [];
	export let min = 0;

	function round (n) {
		return Math.round( n * Math.pow(10,decimals) ) / Math.pow(10,decimals); 
	}

	function onKeydown(e) {
		if (e.code === 'ArrowUp') {
			if(e.shiftKey) {
				value = parseFloat(value) + parseFloat(step * 10)
			}else {
				value = parseFloat(value) + parseFloat(step)
			}
			value = round(value)
			e.preventDefault();
		}
		if (e.code === 'ArrowDown') {
			if(e.shiftKey) {
				value = parseFloat(value) - parseFloat(step * 10)
			}else {
				value = parseFloat(value) - parseFloat(step)
			}
			value = Math.max(min, value)
			value = round(value)
			e.preventDefault();
		}
	}
</script>

<style>
  .wrapper {
    width: 35%;
    display: flex;
  }
  input,
  select {
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
  input:active,
  input:focus,
  select:active,
  select:focus {
    background: #ebf0f7;
  }
  select option {
    background: #ffffff;
  }
  select option:active,
  select option:hover,
  select option:focus {
    background: #d9e3f0;
  }
</style>

<div class="wrapper" on:keydown={e => onKeydown(e)}>
  {#if type !== TYPE_OPTIONS}
    {#if type === TYPE_DOLLAR}
      <span>$</span>
    {/if}
    <input {placeholder} bind:value />
    {#if type === TYPE_PERCENT}
      <span>%</span>
    {/if}
    {#if type === TYPE_YEAR}
      <span>Years</span>
    {/if}
  {:else}
    <select bind:value>
      {#each options as option}
        <option value={option.value}>{option.title}</option>
      {/each}
    </select>
  {/if}
</div>
