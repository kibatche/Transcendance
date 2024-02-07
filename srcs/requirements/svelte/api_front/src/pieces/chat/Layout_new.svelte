<script lang="ts">

	import { history, add_history, msgs, user, socket, current_room } from './Store_chat';
	import { join_room, change_room, get_room_messages, get_all_rooms } from './Request_rooms';
	import { to_print } from './Utils_chat';
	import Button from './Element_button.svelte';

	let rooms = get_all_rooms();

	// join the room
	async function join_rooms(room)
	{
		to_print("inside join_room");

		const updated_room = await join_room(room);
		if (updated_room.protection)
		{
			current_room.set(updated_room);
			add_history("password");
		}
		else
			await change_room(updated_room);
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- new -->
	<Button my_class="new deactivate">
		new
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- panel_new -->
	<div class="panel panel_new __border_top">
		<Button new_layout="create" my_class="create">
			create
		</Button>
		<p>join room :</p>
		<div class="public_rooms">
			<div class="__show_if_only_child">
				<p class="__center">/ there are no public rooms yet /</p>
			</div>
			{#await rooms}
				<p>rooms are loading...</p>
			{:then rooms}
				{#each rooms as room}
					<Button my_class="list" on:click={function() {join_rooms(room)}}>
						{room.name}
					</Button>
				{/each}
			{/await}
		</div>
	</div>

</div>

<style>

	/* grid layout "new"
	*/
	.grid_box :global(.back     ) {grid-area: back;}
	.grid_box :global(.new      ) {grid-area: new;}
	.grid_box :global(.close    ) {grid-area: close;}
	.grid_box :global(.panel_new) {grid-area: panel_new;}
	.grid_box {
		grid:
			' back       new        close     ' auto
			' panel_new  panel_new  panel_new ' 1fr
			/ auto       1fr        auto      ;
	}


</style>

