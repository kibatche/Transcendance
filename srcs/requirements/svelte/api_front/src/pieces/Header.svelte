<script lang="ts">
	import { push } from "svelte-spa-router";
	import { location } from 'svelte-spa-router';

	$: current = $location;

	let handleClickLogout = async () =>
	{
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/auth/logout`,
			{
				method: 'POST',
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch handleClickLogout: ", error);
		});

		push('/');
	};

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="header">
	<img src="/img/logo_potato.png" alt="Potato Pong Logo" on:click={() => (push('/'))}>
	<div class="center">
		<button class:selected="{current === '/game'}" on:click={() => (push('/game'))}>Play</button>
		<button class:selected="{current === '/spectator'}" on:click={() => (push('/spectator'))}>Spectate</button>
		<button class:selected="{current === '/ranking'}" on:click={() => (push('/ranking'))}>Ranking</button>
		<button class:selected="{current === '/profile'}" on:click={() => (push('/profile'))}>My Profile</button>
		<button class:selected="{current === '/profile/users'}" on:click={() => (push('/profile/users'))}>Users</button> 
	</div>
	<button class="logout" on:click={handleClickLogout}>Log Out</button>
</div>

<style>
  .header div.center button.selected {
    text-decoration: underline;
    background-color: #8c0000;
  }

  .header div.center button {
    background-color: #444;
    border-color: #071013;
    color: white;
    font-family: "PressStart2P";
    border-width: 2px;
    font-size: 1vw;
  }


  .header button.logout {
    background-color: #008c8c;
    border-color: #071013;
    color: white;
    font-family: "PressStart2P";
    border-width: 2px;
    font-size: 1vw;
  }

  .header {
    overflow: hidden;
    background: #FB8B24;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    border-bottom: 4px solid #071013;
    position: relative;
    display: block;
    padding: 10px;
  }

  .header div.center {
    width: fit-content;
    justify-self: center;
    position: absolute;
    left: 50%;
    display: inline-block;
    -ms-transform: translateX(-50%); 
    transform: translateX(-50%);
  }

  .header button.logout {
    float: right;
  }

  .header img{
    cursor: pointer;
    max-width: 10%;
    float: left;
  }

  button:hover{
    cursor: pointer;
    background-color: rgb(0, 166, 255) !important;
  }

</style>
