<script lang="ts">

	/* ProfileDisplayOneUser is the same as DisplayAUser except sources the username from params from router rather than
	from a regular var. But yea it's functionally identical, seemed easier to just have a duplicate rather than figuring
	out how to get a more complicated things to do 2 jobs.*/

	import { onMount } from 'svelte';
	import GenerateUserDisplay from '../../pieces/GenerateUserDisplay.svelte';
	import MatchHistory from '../../pieces/MatchHistory.svelte';
	import { fetchUser } from "../../pieces/utils";

	export let params;
	let oneUser;

	onMount( async() => {
		oneUser = await fetchUser(params.username);
	})

</script>

<div class="background-pages">
	{#if oneUser}
		<GenerateUserDisplay user={oneUser}/>
		<MatchHistory user={oneUser}/>
	{:else}
		<h2>Sorry</h2>
		<div>Failed to load user {params.username}</div>
	{/if}
</div>

<style>
  h2 {
    text-align: center;
  }
  div {
    text-align: center;
  }
</style>
