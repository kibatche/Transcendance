<script lang="ts">

	import { history, add_history, current_room } from './Store_chat';
	import { change_room, validate_password, change_password, add_password, remove_password } from './Request_rooms';
	import type { FetchResponse } from './Types_chat';
	import { to_print } from './Utils_chat';
	import Button from './Element_button.svelte';
	import Warning from './Element_warning.svelte';

	export let mode = "validate";

	let password_state = "";
	if (mode === 'change')
		password_state = "new";
	if (mode === 'remove')
		password_state = "current";

	let room_password: string;
	let room_old_password: string;
	let response: FetchResponse;
	let show_error = false;

	async function handleSubmit(evt)
	{
		to_print("in handleSubmit");

		let formIsValid = evt.target.checkValidity();

		if (!formIsValid)
			return;

		let room = {
			name: $current_room.name,
			type: $current_room.type,
			password: room_password,
		};
		room.protection = true;
		if (mode === 'remove')
			room.protection = false;

		// send password
		if (mode === 'validate')
			response = await validate_password(room);
		if (mode === 'add')
			response = await add_password(room);
		if (mode === 'change')
			response = await change_password(room, room_old_password);
		if (mode === 'remove')
			response = await remove_password(room);

		// go to room
		if (response.status >= 300 || response.error)
			show_error = response.error;
		else
			await change_room(response.room);
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- room_name -->
	<Button my_class="room_name deactivate">
		{$current_room.name}
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- panel_password -->
	<div class="panel panel_password __border_top">
		<p class="title __center">this room is protected</p>
		<form on:submit|preventDefault={handleSubmit}>
			{#if show_error}
				<Warning content={response.message}/>
			{/if}
			{#if mode === 'change'}
				<label for="chat_old_pswd"><p>enter old password :</p></label>
				<input  id="chat_old_pswd" bind:value={room_old_password} type="password" placeholder="minimum 8 characters" minlength="8" name="old_password" required>
			{/if}
			<label for="chat_pswd"><p>enter {password_state} password :</p></label>
			<input  id="chat_pswd" bind:value={room_password} type="password" placeholder="minimum 8 characters" minlength="8" name="password" required>
			<input type="submit" value="&#x2BA1">
		</form>
	</div>

</div>

<style>

	/* grid layout "password"
	*/
	.grid_box :global(.back          ) {grid-area: back;}
	.grid_box :global(.room_name     ) {grid-area: room_name;}
	.grid_box :global(.close         ) {grid-area: close;}
	.grid_box :global(.panel_password) {grid-area: panel_password;}
	.grid_box {
		grid:
			' back            room_name       close           ' auto
			' panel_password  panel_password  panel_password  ' 1fr
			/ auto            1fr             auto            ;
	}


	/* submit
	*/
	form input[type=submit] {
		margin-top: 20px;
	}


</style>


