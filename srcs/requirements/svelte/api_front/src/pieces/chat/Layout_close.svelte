<script lang="ts">

	import Button from './Element_button.svelte';

</script>

<div class="grid_box">
	<Button new_layout="home" my_class="chat">
		chat
	</Button>
</div>

<style>

	/* layout "close"
	*/
	.grid_box :global(.chat) {grid-area: chat;}
	.grid_box {
		gap: 0px;
		grid:
			' chat ' auto
			/ auto ;
	}
	:global(.chat_box.close) .grid_box {
		margin: 0px;
		width: auto;
		height: auto;
	}




	/* * * * * * * * * * * * * * * * * * * * *
		GLOBAL STYLES
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
		margin: 0px;
		gap: 5px;
		width: 100%;
		height: 100%;
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
		color: rgb(100, 100, 100);
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
		border-top: 1px solid black;
	}


	/* __check_change_next
	*/
	.chat_box :global(.__check_change_next:checked ~ .__to_show) {
		display: flex;
	}
	.chat_box :global(.__check_change_next:checked ~ .__to_block),
	.chat_box :global(.__check_change_next:checked ~ .__to_block *) {
		pointer-events: none;
		color: rgb(100, 100, 100);
	}
	.chat_box :global(.__to_show) {
		display: none;
	}


</style>


