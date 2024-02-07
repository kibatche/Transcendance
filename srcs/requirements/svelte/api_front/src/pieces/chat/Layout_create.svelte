<script lang="ts">

	import { history, add_history, msgs, allowed_chars } from './Store_chat';
	import { change_room, create_room } from './Request_rooms';
	import { onMount } from 'svelte';
	import type { FetchResponse } from './Types_chat';
	import Button from './Element_button.svelte';
	import Warning from './Element_warning.svelte';

	let allowed_chars = 'loading...';
	//let regex;
	onMount(async() => {
		let response = await fetch('/api/v2/chat/allowedchars');
		let data = await response.json();
		allowed_chars = data.chars;
		//regex = new RegExp(`^[a-zA-Z0-9\\s${allowed_chars}]+$`);
	});

	let room_name: string;
	let room_type: string;
	let is_protected = false;
	let room_password: string;
	let response: FetchResponse;
	let show_error = false;

	async function handleSubmit(evt)
	{
		let formIsValid = evt.target.checkValidity();

		if (!formIsValid)
			return;

		let room = {
			name: room_name,
			type: room_type,
			protection: is_protected,
		};
		if (is_protected === true)
			room.password = room_password;

		// send the new room
		response = await create_room(room);

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

	<!-- create -->
	<Button my_class="create deactivate">
		create
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- panel_create -->
	<div class="panel panel_create __border_top">
		<form on:submit|preventDefault={handleSubmit}>
			{#if show_error}
				<Warning content={response.message}/>
			{/if}
			<!-- name: -->
			<label for="chat_name"><p>new room name :</p></label>
			<!--
			<input  id="chat_name" bind:value={room_name} name="room_name" placeholder="allowed special characters: {allowed_chars}" pattern={regex} required>
			-->
			<input  id="chat_name" bind:value={room_name} name="room_name" placeholder="allowed special characters: {allowed_chars}" required>
			<!-- [ ] pubic -->
			<label for="chat_public" class="_radio">
				<p>public</p>
				<input  id="chat_public" bind:group={room_type} type="radio" name="room_type" value="public" required>
			</label>
			<!-- [ ] private -->
			<label for="chat_private" class="_radio">
				<p>private</p>
				<input  id="chat_private" bind:group={room_type} type="radio" name="room_type" value="private" required>
			</label>
			<!-- [ ] protected -->
			<label for="chat_protected" class="_checkbox">
				<p>protected</p>
				<input  id="chat_protected" bind:checked={is_protected} type="checkbox" name="room_type" value="protected">
			</label>
			<!-- [x] protected -->
			{#if is_protected === true}
				<label for="chat_pswd">choose a password :</label>
				<input  id="chat_pswd" bind:value={room_password} type="password" placeholder="minimum 8 characters" minlength="8" name="password" required>
			{/if}
			<input type="submit" value="&#x2BA1">
		</form>
	</div>

</div>

<style>

	/* grid layout "create"
	*/
	.grid_box :global(.back        ) {grid-area: back;}
	.grid_box :global(.create      ) {grid-area: create;}
	.grid_box :global(.close       ) {grid-area: close;}
	.grid_box :global(.panel_create) {grid-area: panel_create;}
	.grid_box {
		grid:
			' back          create        close         ' auto
			' panel_create  panel_create  panel_create  ' 1fr
			/ auto          1fr           auto          ;
	}


	/* radio elements style check
	*/
	.panel label {
		display: inline;
		cursor: pointer;
		padding-right: 10px;
		margin: 10px 0px 10px auto;
	}
	.panel label._radio {
		margin-bottom: 0px;
	}
	.panel label._checkbox {
		margin-top: 20px;
	}
	.panel label * {
		display: inline;
	}
	.panel label p {
		margin-top: 0px;
		margin-bottom: 0px;
	}


	/* submit
	*/
	.panel input[type=submit] {
		margin-top: 20px;
	}


</style>


