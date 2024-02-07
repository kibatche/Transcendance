<script lang="ts">

	import { layout } from './Store_chat';

</script>

<!--
<div class="{$layout} chat_box" style="background-color: {color};">
-->
<div class="{$layout} chat_box">
	<slot></slot>
</div>

<style>

	/* chat_box and default style
	*/
	.chat_box {
		display: flex;
		position: fixed;
		bottom: 20px;
		right: 20px;
		padding: 0px;
		width: auto;
		height: auto;
		border: var(--lines_width) solid var(--lines_color);
		background-color: var(--bg_color);
		z-index: 1;
	}




	/* * * * * * * * * * * * * * * * * * * * *
		GLOBAL STYLES
	*/


	/* gobal variables styles
	*/


	/* Hide scrollbar
	*/
	.chat_box :global(*) {
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
	}
	.chat_box :global(*::-webkit-scrollbar) {
		display: none;  /* Chrome, Safari and Opera */
	}


	/* for grid_box and all childrens
	*/
	.chat_box :global(.grid_box) {
		display: grid;
		margin: 5px;
		gap: 5px;
		width: 300px;
		height: 400px;
	}
	.chat_box :global(.grid_box *) {
		display: flex;
		flex-direction: column;
		position: relative;
		box-sizing: border-box;
	}


	/* all p
	*/
	.chat_box :global(.grid_box p) {
		padding: 10px;
		font-size: 15px;
		color: var(--lines_color);
	}


	/* all panel
	*/
	.chat_box :global(.panel) {
		overflow-y: scroll;
	}
	.chat_box :global(.panel > *) {
		margin-top: 10px;
		margin-bottom: 10px;
	}




	/* * * * * * * * * * * * * * * * * * * * *
		GLOBAL UTILITIES
	*/


	/* __show_if_only_child
	*/
	.chat_box :global(.__show_if_only_child) {
		display: none;
	}
	.chat_box :global(.__show_if_only_child:only-child) {
		display: flex;
		color: var(--lines_light_color);
	}


	/* __center
	*/
	.chat_box :global(.__center) {
		margin-left: auto;
		margin-right: auto;
	}


	/* __border_top
	*/
	.chat_box :global(.__border_top) {
		border-top: var(--lines_width) solid var(--lines_color);
	}


	/* __check_change_next
	*/
	.chat_box :global(.__check_change_next:checked ~ .__to_show) {
		display: flex;
	}
	.chat_box :global(.__check_change_next:checked ~ .__to_block),
	.chat_box :global(.__check_change_next:checked ~ .__to_block *) {
		pointer-events: none;
		color: var(--lines_light_color);
	}
	.chat_box :global(.__to_show) {
		display: none;
	}


</style>

