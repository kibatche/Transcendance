
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade, fly } from 'svelte/transition';
	
	import { fetchUser, fetchAllUsers, fetchAvatar } from "../../pieces/utils";

	import * as pong from "./client/pong";
	import { gameState } from "./client/ws";

	import { invited_username } from '../../pieces/store_invitation';
	import { showHeader } from '../../pieces/store_showHeader';

	//user's stuff
	let user;
	let allUsers;

	let playerOneAvatar = "";
	let playerTwoAvatar = "";

	//Game's stuff
	const options = new pong.InitOptions();
	const gameAreaId = "game_area";

	//boolean for html page
	let hiddenGame = true;
	let showGameOptions = true;
	let showInvitations = false;
	let showError = false;
	let errorMessage = "";
	let showWaitPage = false;

	let invitations = [];
	let watchGameStateInterval;
	const watchGameStateIntervalRate = 142;
	let watchMatchStartInterval;
	const watchMatchStartIntervalRate = 111;
	let timeoutArr = [];

	onMount( async() => {
		user = await fetchUser();
		allUsers = await fetchAllUsers();

		if (!user) {
			errorMessage = "User load failed";
			showError = true;
			return;
		}

		options.playerOneUsername = user.username;
		if ($invited_username) {
			options.isSomeoneIsInvited = true;
			options.playerTwoUsername = $invited_username;
			invited_username.set("");
		}
	})

	onDestroy( async() => {
		clearInterval(watchMatchStartInterval);
		clearInterval(watchGameStateInterval);
		timeoutArr.forEach((value) => {
			clearTimeout(value);
		});
		pong.destroy();
		setHiddenGame(true);
	})

	function resetPage() {
		setHiddenGame(true);
		showGameOptions = true;
		showInvitations = false;
		showError = false;
		showWaitPage = false;
		options.reset(user.username);
		pong.destroy();
	};

	function leaveMatch() {
		clearInterval(watchMatchStartInterval);
		clearInterval(watchGameStateInterval);
		resetPage();
	};

	const initGame = async() =>
	{
		showWaitPage = true;

		const matchOptions = pong.computeMatchOptions(options);
		fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/game/ticket`, {
				method : "POST",
				headers : {'Content-Type': 'application/json'},
				body : JSON.stringify({
					playerOneUsername : options.playerOneUsername,
					playerTwoUsername : options.playerTwoUsername,
					gameOptions : matchOptions,
					isGameIsWithInvitation : options.isSomeoneIsInvited
				})
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			return response.json();
		})
		.then((body) => {
			if (body.token)
			{
				if (options.isSomeoneIsInvited) {
					options.reset(user.username);
					fetchInvitations();
				}
				else {
					watchMatchStartInterval = setInterval(watchMatchStart, watchMatchStartIntervalRate);
					watchGameStateInterval = setInterval(watchGameState, watchGameStateIntervalRate);
					pong.init(matchOptions, options, gameAreaId, body.token);
					setHiddenGame(false);
				}
			}
			else {
				throw new Error(`body.token undefined`);
			}
		})
		.catch((error) => { 
			console.log("catch initGame: ", error);
			errorMessage = "Get ticket error";
			showError = true;
			options.reset(user.username);
			const timeout = setTimeout(() => {
				showError = false;
			}, 5000);
			timeoutArr = timeoutArr.concat([timeout]);
		});

		showWaitPage = false;
	}

	const initInvitationGame = async(invitation : any) =>
	{
		showWaitPage = true;
		console.log("invitation : ");
		console.log(invitation);
		if (invitation.token)
		{
			watchMatchStartInterval = setInterval(watchMatchStart, watchMatchStartIntervalRate);
			watchGameStateInterval = setInterval(watchGameState, watchGameStateIntervalRate);
			options.playerOneUsername = invitation.playerOneUsername;
			options.playerTwoUsername = invitation.playerTwoUsername;
			options.isSomeoneIsInvited = true;
			if (user.username === invitation.playerTwoUsername) {
				options.isInvitedPerson = true;
			}
			pong.init(invitation.gameOptions, options, gameAreaId, invitation.token);
			showWaitPage = false;
			setHiddenGame(false);
		}
	}

	async function watchMatchStart()
	{
		if (gameState.matchStarted)
		{
			clearInterval(watchMatchStartInterval);
			playerOneAvatar = await fetchAvatar(gameState.playerOneUsername);
			playerTwoAvatar = await fetchAvatar(gameState.playerTwoUsername);
			gameState.matchStarted = gameState.matchStarted; // trigger Svelte reactivity
		}
	}

	const watchGameState = () => {
		console.log("watchGameState");
		if (gameState.matchAborted || gameState.matchEnded)
		{
			clearInterval(watchGameStateInterval);
			gameState.matchEnded = gameState.matchEnded; // trigger Svelte reactivity
			gameState.matchAborted = gameState.matchAborted; // trigger Svelte reactivity
			console.log("watchGameState, end");
			const timeout = setTimeout(() => {
				resetPage();
				console.log("watchGameState : setTimeout");
			}, 5000);
			timeoutArr = timeoutArr.concat([timeout]);
		}
	}

	const switchToGameOptions = () => {
		showGameOptions = true;
		showInvitations = false;
	}

	const fetchInvitations = async() => {
		console.log("fetchInvitations");
		invitations = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/game/invitations`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchInvitations: ", error);
			return [];
		});

		showGameOptions = false;
		showInvitations = true;
	}

	const rejectInvitation = async(invitation) =>
	{
		fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/game/decline`, {
			method: "POST",
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({
				token : invitation.token
			})
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch rejectInvitation: ", error);
		});

		fetchInvitations();
	}

	const acceptInvitation = async(invitation : any) =>
	{
		fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/game/accept`, {
			method: "POST",
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({
				token : invitation.token
			})
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
			initInvitationGame(invitation);
		})
		.catch((error) => { 
			console.log("catch rejectInvitation: ", error);
			fetchInvitations();
		});
	}

	let game_page_class = "";
	function setHiddenGame(value: boolean)
	{
		if (value === true) {
			game_page_class = "";
			window.document.body.classList.remove('dim_background');
			showHeader.set(true);
		}
		else {
			game_page_class = "dim_background";
			window.document.body.classList.add('dim_background');
			showHeader.set(false);
		}
		hiddenGame = value;
	}

</script>

<!-- <div id="game_page"> Replacement for <body>.
	Might become useless after CSS rework. -->
<div id="game_page" class={game_page_class}>

	{#if showError}
		<div class="div_game" in:fly="{{ y: 10, duration: 1000 }}">
			<fieldset>
				<legend>Error</legend>
				<p>{errorMessage}</p>
			</fieldset>
		</div>
	{/if}

	{#if !hiddenGame}
		{#if gameState.matchEnded}
			<div class="div_game" in:fly="{{ y: 10, duration: 1000 }}">
				<p>The match is finished !</p>
			</div>
		{:else if gameState.matchAborted}
			<div class="div_game" in:fly="{{ y: 10, duration: 1000 }}">
				<p>The match has been aborted</p>
			</div>
		{/if}
	{/if}

	<div id="canvas_container" hidden={hiddenGame}>
		<canvas id={gameAreaId}/>
	</div>

	{#if !hiddenGame}
		{#if gameState.matchStarted}
			<div class="div_game">
				<img class="avatar" src="{playerOneAvatar}" alt="player one avatar">
				'{gameState.playerOneUsername}' VS '{gameState.playerTwoUsername}'
				<img class="avatar" src="{playerTwoAvatar}" alt="player two avatar">
			</div>
		{/if}

		{#if gameState.matchStarted && !gameState.matchEnded}
			<div class="div_game">
				<button class="pong_button margin_top" on:click={leaveMatch}>forfeit</button>
			</div>
		{:else if !gameState.matchStarted}
			<div class="div_game">
				<button class="pong_button margin_top" on:click={leaveMatch}>leave matchmaking</button>
			</div>
		{/if}
	{/if}


	{#if showWaitPage}
		<div class="div_game" in:fly="{{ y: 10, duration: 1000 }}">
			<fieldset>
				<legend>Connecting to the game...</legend>
				<p>Please wait...</p>
			</fieldset>
		</div>
	{/if}

<!--  -->

	{#if hiddenGame}
		{#if showGameOptions}
			<div class="div_game" id="game_options">
				<button class="pong_button game_options_button" on:click={fetchInvitations}>Show invitations</button>
				<fieldset in:fly="{{ y: 10, duration: 1000 }}">
					<legend>game options</legend>

					<label for="multi_balls">
						<input type="checkbox" id="multi_balls" name="multi_balls" bind:checked={options.multi_balls}>
						Multiples balls
					</label>

					<label for="moving_walls">
						<input type="checkbox" id="moving_walls" name="moving_walls" bind:checked={options.moving_walls}>
						Moving walls
					</label>

					<div>
						sound :
						<label for="sound_on">
							<input type="radio" id="sound_on" name="sound_selector" bind:group={options.sound} value="on">
							on
						</label>
						<label for="sound_off">
							<input type="radio" id="sound_off" name="sound_selector" bind:group={options.sound} value="off">
							off
						</label>
					</div>

					<label for="invitation_checkbox">
						<input type="checkbox" id="invitation_checkbox" bind:checked={options.isSomeoneIsInvited}>
						Invite a player
					</label>

					{#if options.isSomeoneIsInvited}
						<select bind:value={options.playerTwoUsername}>
							{#each allUsers as invitedUser }
								<option value={invitedUser.username}>{invitedUser.username}</option>
							{/each}
						</select>
					{/if}
					<div>
						<button class="pong_button" on:click={initGame}>PLAY</button>
					</div>
				</fieldset>
			</div>
		{/if}

		{#if showInvitations}
			<div class="div_game" id="game_invitations">
				<button class="pong_button game_options_button" on:click={switchToGameOptions}>Play a Game</button>
				<fieldset in:fly="{{ y: 10, duration: 1000 }}">
					<legend>invitations</legend>
					<button class="pong_button" on:click={fetchInvitations}>Reload</button>
					{#if invitations.length !== 0}
						{#each invitations as invitation}
							<div>
								{invitation.playerOneUsername} VS {invitation.playerTwoUsername}
								<button class="pong_button" on:click={() => acceptInvitation(invitation)}>V</button>
								<button class="pong_button" on:click={() => rejectInvitation(invitation)}>X</button>
							</div>
						{/each}
					{:else}
						<p>Currently, no one asked to play with you.</p>
					{/if}
				</fieldset>
			</div>
		{/if}
	{/if}

<div id="preload_font">.</div>

</div> <!-- div "game_page" -->

<style>

#preload_font {
	font-family: "Bit5x3";
	opacity:0;
	height:0;
	width:0;
	display:inline-block;
}

.dim_background {
	background-color: #222;
}

:global(body.dim_background) {
	background-color: #222;
}

#game_page {
	margin: 0;
	position: relative;
	width: 100%;
	height: auto;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
}

.game_options_button {
	margin-top: 15px;
	margin-bottom: 15px;
}

#canvas_container {
	margin-top: 20px;
	text-align: center;
	/* border: dashed rgb(245, 245, 245) 5px; */
	/* max-height: 80vh; */
	/* overflow: hidden; */
}
canvas {
	font-family: "Bit5x3";
	background-color: #333;
	max-width: 65vw;
	width: 80%;
}

.div_game {
	text-align: center;
	font-family: "PressStart2P";
	color: rgb(245, 245, 245);
	font-size: 1vw;
}
.div_game fieldset {
	max-width: 50vw;
	width: auto;
	margin: 0 auto;
}
.div_game fieldset div {
	padding: 10px;
}
.pong_button {
	font-family: "PressStart2P";
	color: rgb(245, 245, 245);
	background-color: #333333;
	font-size: 1vw;
	padding: 10px;
}
.avatar {
	height: 5vw;
    width: 5vw;
	margin-top: 2vw;
	margin-bottom: -2vw;
}
button.margin_top {
	margin-top: 1vw;
}
</style>
