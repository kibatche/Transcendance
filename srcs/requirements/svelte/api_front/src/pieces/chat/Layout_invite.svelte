<script lang="ts">

	import { history, add_history, user, current_room } from './Store_chat';
	import { get_all_users, invite_user } from './Request_rooms';
	import { to_print } from './Utils_chat';
	import Button from './Element_button.svelte';

	let users = get_all_users();

	// invite user in this room
	async function invite_this_user(username: string)
	{
		to_print("inside invite_this_user");

		invite_user(username);
		add_history("room");
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- new -->
	<Button my_class="invite deactivate">
		invite
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- room_name -->
	<Button my_class="room_name deactivate __border_top">
		{$current_room.name}
	</Button>

	<!-- panel_new -->
	<div class="panel panel_invite __border_top">
		<p>invite someone in this room :</p>
		<div>
			<div class="__show_if_only_child">
				<p class="__center">/ there is no one to invite yet /</p>
			</div>
			{#await users}
				<p>users are loading...</p>
			{:then users}
				{#each users as user}
					<Button my_class="list" on:click={function() {invite_this_user(user.username)}}>
						{user.username}
					</Button>
				{/each}
			{/await}
		</div>
	</div>

</div>

<style>

	/* grid layout "new"
	*/
	.grid_box :global(.back        ) {grid-area: back;}
	.grid_box :global(.invite      ) {grid-area: invite;}
	.grid_box :global(.close       ) {grid-area: close;}
	.grid_box :global(.room_name   ) {grid-area: room_name;}
	.grid_box :global(.panel_invite) {grid-area: panel_invite;}
	.grid_box {
		grid:
			' back         invite       close        ' auto
			' room_name    room_name    room_name    ' auto
			' panel_invite panel_invite panel_invite ' 1fr
			/ auto         1fr          auto         ;
	}


</style>

