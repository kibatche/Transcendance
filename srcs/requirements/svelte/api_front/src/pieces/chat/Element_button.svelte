<script lang="ts">

	import { history, add_history, back_history } from './Store_chat';
	import { writable } from 'svelte/store';

	export let my_class = "";
	export let my_title = "";
	export let new_layout = "";

	function update_layout() {
		console.log("my_class:", my_class);
		if (my_class.includes("back"))
		{
			console.log("back history");
			back_history();
		}
		else if (new_layout !== "")
		{
			console.log("add history:", new_layout);
			add_history(new_layout);
		}
	//	else
	//	{
	//		console.log("add history home default");
	//		add_history("home");
	//	}
	}

</script>

<button on:click={update_layout} on:click title={my_title} class={my_class}>
	<p><slot></slot></p>
</button>

<style>


	/* default config
	*/
	button {
		padding: 0px;
		margin: auto;
		width: 100%;
		cursor: pointer;
		outline: none;
		border: none;
		border-radius: 0px;
		background-color: var(--btn_color);
	}

	button p {
		width: 100%;
		margin: auto;
		text-align: center;
	}
	:global(.chat_box) button p {
		color: var(--lines_light_color);
	}
	button:hover {
		background-color: var(--btn_color_hover);
	}
	button:active {
		background-color: var(--btn_color_active);
	}

	/* .list
	*/
	.list:not(:hover) {
		background-color: var(--btn_light_color);
	}
	.list p {
		text-align: left;
	}


	/* .transparent
	*/
	.transparent:not(:hover) {
		background-color: transparent;
	}
	:global(.chat_box) button.transparent p {
		color: var(--lines_color);
	}


	/* .deactivated
	*/
	.deactivate {
		background-color: transparent;
		pointer-events: none;
	}
	:global(.chat_box) button.deactivate p {
		color: var(--lines_color);
	}


	/* .border
	*/
	.border {
		border: 1px solid rgb(150, 150, 150);
	}


	/* .light
	*/
	.light {
		background-color: var(--btn_light_color);
	}
	.light.border {
		border: var(--lines_width) solid var(--btn_light_color_border);
	}
	.light:hover {
		background-color: var(--btn_light_color_hover);
	}
	.light.border:hover {
		border-color: var(--btn_light_color_border);
	}
	.light:active {
		background-color: var(--btn_light_color_active);
	}


	/* .thin
	*/
	.thin p {
		padding: 5px;
	}


	/* .icon
	*/
	.icon p {
		display: none;
	}
	.icon:not(:hover) {
		background-color: transparent;
	}
	.icon {
		width: 30px;
		height: 100%;
		padding: 0px;
	}


	/* .dots
	*/
	.dots::after {
		content: '\2807';
		font-size: 20px;
		position: absolute;
		top: 50%;
		left: 0px;
		width: 100%;
		height: auto;
		text-align: center;
		transform: translateY(-50%);
		cursor: pointer;
		color: var(--lines_color);
	}


	/* .close
	*/
	.close::before {
		content: "";
		position: absolute;
		top: calc(50% - var(--lines_width) / 2);
		left: 5px;
		width: 20px;
		height: var(--lines_width);
		background-color: var(--lines_color);
	}


	/* .back
	*/
	.back::before {
		content: "";
		position: absolute;
		top: calc(50% - 6px - 1px);
		left: 6px;
		width: 14px;
		height: 14px;
		border-left: var(--lines_width) solid var(--lines_color);
		border-bottom: var(--lines_width) solid var(--lines_color);
		transform: rotate(45deg);
	}


	/* .blocked
			https://www.fileformat.info/info/unicode/category/So/list.htm
			U+1F512 	LOCK 				🔒
			U+1F513		OPEN LOCK 	🔓
	*/
	.blocked {
		padding-left: 30px;
	}
	.blocked::before {
		content: "";
		position: absolute;
		top: calc(50% - 2px);
		left: 10px;
		cursor: pointer;
		width: 13px;
		height: 10px;
		border-radius: 2px;
		background-color: var(--lines_color);
	}
	.blocked::after {
		content: "";
		position: absolute;
		top: calc(50% - 9px);
		left: 12px;
		cursor: pointer;
		width: 9px;
		height: 13px;
		border-radius: 5px;
		box-sizing: border-box;
		border: 3px solid var(--lines_color);
	}


	/* .admin
	*/
	.admin p {
		flex-direction: row;
	}
	.admin :global(span) {
		margin-left: auto;
		color: var(--lines_light_color);
	}


</style>

