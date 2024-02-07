<script lang="ts">

	import { history, add_history, msgs, user, current_room } from './Store_chat';
	import { change_room, get_room_messages, get_my_rooms } from './Request_rooms';
	import { to_print } from './Utils_chat';
	import { onMount } from 'svelte';
	import Button from './Element_button.svelte';
	import type { FetchResponse } from './Types_chat';
	import Warning from './Element_warning.svelte';

	let rooms = get_my_rooms();

	let response: FetchResponse;
	let show_error = false;

	// go to clicked room
	async function go_to_room(room)
	{
		to_print("inside go_to_room");

		to_print("room:", room);
		if (room.protection && !room.allowed)
		{
			await current_room.set(room);
			add_history("password");
		}
		else
		{
			response = await change_room(room);

			// print error message
			if (response.status >= 300 || response.error)
				show_error = response.error;
		}
	}

</script>

<div class="grid_box">

	<!-- settings -->
	<Button new_layout="settings" my_class="settings dots icon">
		settings
	</Button>

	<!-- new -->
	<Button new_layout="new" my_class="new transparent">
		new
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- panel home -->
	<div class="panel panel_home __border_top">
		{#if show_error}
			<Warning content={response.message}/>
		{/if}
		<p class="title">list of your rooms :</p>
		<div class="room_list">
			<div class="__show_if_only_child">
				<p class="__center">/ you have no chat room yet /</p>
			</div>
			{#await rooms}
				<p>rooms are loading...</p>
			{:then rooms}
				{#each rooms as room}
					<Button my_class="list" on:click={function(){go_to_room(room)}}>
						{room.client_name}
					</Button>
				{/each}
			{/await}
		</div>
	</div>

</div>

<style>

	/* grid layout "home"
	*/
	.grid_box :global(.settings  ) {grid-area: settings;}
	.grid_box :global(.close     ) {grid-area: close;}
	.grid_box :global(.new       ) {grid-area: new;}
	.grid_box :global(.panel_home) {grid-area: panel_home;}
	.grid_box {
		grid:
			' settings    new         close      ' auto
			' panel_home  panel_home  panel_home ' 1fr
			/ auto        1fr         auto       ;
	}


	/* panel home
	*/
	.panel_home p.title {
		margin: 10px auto 0px auto;
	}

</style>

