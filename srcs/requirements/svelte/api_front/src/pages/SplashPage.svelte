<script lang="ts">
	import { push } from "svelte-spa-router";
	import { onMount } from 'svelte';

	import { fetchUser } from "../pieces/utils";

	let user;

	onMount(async () => {
		user = await fetchUser();
	});

	const login = async() => {
		window.location.href = `http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/auth`;
		console.log('you are now logged in');
	}

	const logout = async() => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/auth/logout`,
			{
				method: 'POST'
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch logout: ", error);
		});

		user = null;
	};

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container">
  <div class="splash-page">
      {#if user && user.username}
        <button class="button-in" on:click={ () => (push('/profile')) }>Profile</button>
        <button class="button-out"  on:click={logout}>Logout</button>
      {:else}
        <button class="button-in" on:click={login}>Login</button>
      {/if}
  </div>
</div>

<style>

.container {
  height: 100%;
  width: 100%;
  position: relative;
  background-image: url('/img/SPLASH_PAGE_BACKGROUND.png');
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}


.splash-page {
  margin: 0;
  position: absolute;
  top: 80%;
  -ms-transform: translateY(-80%);
  transform: translateY(-80%);
  left: 50%;
  -ms-transform: translateX(-50%);
  transform: translateX(-50%);
}

.button-in {
  background-color: #8c0000;
  border-color: #071013;
  border-width: 2px;
  color: white;
  font-family: "PressStart2P";
  font-size: 1vw;
	padding: 10px;
}

.button-out {
  background-color: #008c8c;
  border-color: #071013;
  border-width: 2px;
  color: white;
  font-family: "PressStart2P";
  font-size: 1vw;
	padding: 10px;
}


</style>
