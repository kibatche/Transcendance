<script lang="ts">

	import { history, add_history, current_room, settings_user } from './Store_chat';
	import { get_is_admin, make_admin, set_block_user, remove_block_user } from './Request_rooms';
	import type { FetchResponse } from './Types_chat';
	import { to_print } from './Utils_chat';
	import Button from './Element_button.svelte';
	import { push } from "svelte-spa-router";
	import { invited_username } from '../store_invitation';
	import Warning from './Element_warning.svelte';

	let is_admin = false;
	get_is_admin().then(response => is_admin = response);

	let response: FetchResponse;
	let show_error = false;

	$: console.log("settings_user infos:", $settings_user);

	function game_invitation()
	{
		to_print("in game_invitation");
		const username = $settings_user.name;
		invited_username.set(username);
		push("/game");
	}
	function view_profile()
	{
		to_print("in view_profile");
		push(`/profile/users/${$settings_user.name}`);
	}
	async function block_user()
	{
		to_print("in block_user");
		await set_block_user($settings_user.name);
		add_history("room");
	}
	async function unblock_user()
	{
		to_print("in unblock_user");
		await remove_block_user($settings_user.name);
		add_history("room");
	}
	async function get_list_block_user()
	{
		to_print("in get_list_block_user");
		await list_block_user();
	}
	async function make_user_admin()
	{
		to_print("in make_user_admin");
		response = await make_admin($settings_user.name);
		//show errors
		if (response.status >= 300 || response.error)
			show_error = response.error;
		else
			add_history("room");
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- user -->
	<Button my_class="user deactivate">
		{$settings_user.name}
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- room_name -->
	{#if $history[1] === "room_set"}
		<Button my_class="room_name deactivate __border_top">
			{$current_room.client_name}
		</Button>
	{/if}

	<!-- panel_user -->
	<div class="panel panel_user __border_top">
		{#if show_error}
			<Warning content={response.message}/>
		{/if}
		<p class="__center">user options :</p>
		<Button on:click={view_profile}>
			view profile
		</Button>
		<Button on:click={game_invitation}>
			game invitation
		</Button>
		{#if $settings_user.isblocked}
			<Button on:click={unblock_user}>
				unblock
			</Button>
		{:else}
			<Button on:click={block_user}>
				block
			</Button>
		{/if}

		{#if is_admin && $history[1] === "room_set" && $current_room.type !== "direct"}
			{#if !$settings_user.isadmin}
				<Button on:click={make_user_admin}>
					make admin
				</Button>
			{/if}
			{#if $settings_user.ismute}
				<Button new_layout="mute">
					unmute
				</Button>
			{:else}
				<Button new_layout="mute">
					mute
				</Button>
			{/if}
		{/if}

	</div>

</div>

<style>

	/* grid layout "user"
	*/
	.grid_box :global(.back      ) {grid-area: back;}
	.grid_box :global(.user      ) {grid-area: user;}
	.grid_box :global(.close     ) {grid-area: close;}
	.grid_box :global(.room_name ) {grid-area: room_name;}
	.grid_box :global(.panel_user) {grid-area: panel_user;}
	.grid_box {
		grid:
			' back        user        close       ' auto
			' room_name   room_name   room_name   ' auto
			' panel_user  panel_user  panel_user  ' 1fr
			/ auto        1fr         auto        ;
	}


	/* for line height
	*/
	.panel_user {
		margin-top: -5px;
	}


</style>


