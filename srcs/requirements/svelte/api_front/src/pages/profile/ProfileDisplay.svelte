<script lang="ts">

	import { onMount } from 'svelte';
	import GenerateUserDisplay from '../../pieces/GenerateUserDisplay.svelte';
	import MatchHistory from '../../pieces/MatchHistory.svelte';
	import { push } from 'svelte-spa-router';
	import { fetchUser } from "../../pieces/utils";

	let user;

	onMount( async() => {
		user = await fetchUser();
	})

</script>

<div class="background-pages">
	<div class="outer">
		{#if user !== undefined}
			<button id="setting_button" on:click={() => (push('/profile/settings'))}>Profile Settings</button>
			<GenerateUserDisplay user={user}/>
			<MatchHistory user={user}/>
		{:else}
			<h2>Sorry</h2>
			<div>Failed to load current</div>
		{/if}
	</div>
</div>

<style>

	div.outer{
		max-width: 100%;
		text-align: center;
		padding-bottom: 10px;
	}

	#setting_button {
		margin-top: 1vw;
		font-family: "PressStart2P";
		background-color: #618174;
		border-color: #071013;
		color: white;
		border-width: 2px;
		font-size: 1vw;
	}

</style>
