<script lang="ts">

	import { history, add_history, current_room, settings_user } from './Store_chat';
	import { get_room_users, leave_room, get_is_admin, set_current_room, set_settings_user } from './Request_rooms';
	import { User } from './Types_chat';
	import { to_print } from './Utils_chat';
	import Button from './Element_button.svelte';

	let users: User[] = get_room_users();

	let is_admin = false;
	get_is_admin().then(response => is_admin = response);

	set_current_room();
	$: console.log("current_room infos:", $current_room);

	to_print("current_room:", $current_room);

	function user_profile(room_user: string)
	{
		to_print("in user_profile");
		settings_user.set(room_user);
		set_settings_user(room_user.name);
		add_history("user");
	}

	function user_leave_room()
	{
		to_print("in leave_room");
		leave_room();
		add_history("home");
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- room_name -->
	<Button my_class="room_name deactivate">
		{$current_room.client_name}
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- panel_room_set -->
	<div class="panel panel_room_set __border_top">
		{#if $current_room.type !== "direct"}
			<Button on:click={user_leave_room}>
				leave
			</Button>
			<Button new_layout="invite">
				invite someone
			</Button>
		{/if}
		{#if is_admin === true }
			<p class="__center">you are admin in this room</p>
			{#if $current_room.protection }
				<p class="__center">this room is password protected</p>
				<Button new_layout="change_password">
					change password
				</Button>
				<Button new_layout="remove_password">
					remove password
				</Button>
			{:else}
				<Button new_layout="add_password">
					add password
				</Button>
			{/if}
		{/if}
		<p>room users :</p>
		<div class="room_users">
			<div class="__show_if_only_child">
				<p class="__center">/ there are no public rooms yet /</p>
			</div>
			{#await users}
				<p>list of users is loading...</p>
			{:then users}
				{#each users as user}
					<Button my_class="list admin {user.isblocked ? 'blocked' : ''}" on:click={function(){user_profile(user)}}>
						{user.name}
						{#if user.isadmin }
							<span>admin</span>
						{/if}
					</Button>
				{/each}
			{/await}
		</div>
	</div>


</div>

<style>

	/* grid layout "room_set"
	*/
	.grid_box :global(.back          ) {grid-area: back;}
	.grid_box :global(.room_name     ) {grid-area: room_name;}
	.grid_box :global(.close         ) {grid-area: close;}
	.grid_box :global(.panel_room_set) {grid-area: panel_room_set;}
	.grid_box {
		grid:
			' back            room_name       close          ' auto
			' panel_room_set  panel_room_set  panel_room_set ' 1fr
			/ auto            1fr             auto           ;
	}


</style>


