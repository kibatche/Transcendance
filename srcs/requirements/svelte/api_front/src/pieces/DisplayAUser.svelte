<script lang="ts">

	import { onMount } from 'svelte';
	import GenerateUserDisplay from './GenerateUserDisplay.svelte';
	import { fetchUser } from "../pieces/utils";

  export let aUsername;
  export let loaded = false;
  let aUser;

	onMount( async() => {
    loaded = false;
		aUser = await fetchUser(aUsername);
	})

  const updateUser = async(aUsername) => {
    loaded = false;
    aUser = await fetchUser(aUsername);
  };

	$: aUsername, updateUser(aUsername);

  $: {
    if (!aUser)
      loaded = false;
    else 
      loaded = true;
  }

</script>

<div class="background-pages">
{#if aUser}
  <GenerateUserDisplay user={aUser}/>
{:else}
  <h2>Sorry</h2>
  <div>Failed to load user {aUsername}</div>
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