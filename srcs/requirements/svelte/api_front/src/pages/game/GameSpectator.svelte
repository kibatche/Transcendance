
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade, fly } from 'svelte/transition';

	import MatchOngoingElem from "../../pieces/MatchOngoingElem.svelte";
	import type { MatchOngoing } from "../../pieces/Match";
	import { fetchAvatar } from "../../pieces/utils";

	import * as pongSpectator from "./client/pongSpectator";
	import { gameState } from "./client/ws";

	import { showHeader } from '../../pieces/store_showHeader';

	let playerOneAvatar = "";
	let playerTwoAvatar = "";

	//Game's stuff
	const gameAreaId = "game_area";
	let sound = "off";

	//html boolean for pages
	let hiddenGame = true;

	let matchList: MatchOngoing[] = [];
	let watchGameStateInterval;
	const watchGameStateIntervalRate = 142;
	let timeoutArr = [];

	onMount( async() => {
		await fetchMatchList();
	})

	onDestroy( async() => {
		clearInterval(watchGameStateInterval);
		timeoutArr.forEach((value) => {
			clearTimeout(value);
		});
		pongSpectator.destroy();
		setHiddenGame(true);
	})

	async function resetPage() {
		setHiddenGame(true);
		pongSpectator.destroy();
		await fetchMatchList();
	};

	function leaveMatch() {
		clearInterval(watchGameStateInterval);
		resetPage();
	};

	async function initGameSpectator(match: MatchOngoing)
	{
		watchGameStateInterval = setInterval(watchGameState, watchGameStateIntervalRate);
		pongSpectator.init(match.gameOptions, sound, gameAreaId, match.gameServerIdOfTheMatch);
		
		// Users avatar
		gameState.playerOneUsername = match.playerOneUsername;
		gameState.playerTwoUsername = match.playerTwoUsername;
		playerOneAvatar = await fetchAvatar(gameState.playerOneUsername);
		playerTwoAvatar = await fetchAvatar(gameState.playerTwoUsername);

		setHiddenGame(false);
	};

	const watchGameState = () => {
		console.log("watchGameState")
		// gameState.matchStarted = gameState.matchStarted; // trigger Svelte reactivity
		if (gameState.matchAborted || gameState.matchEnded)
		{
			gameState.matchEnded = gameState.matchEnded; // trigger Svelte reactivity
			gameState.matchAborted = gameState.matchAborted; // trigger Svelte reactivity
			clearInterval(watchGameStateInterval);
			console.log("watchGameState, end")
			const timeout = setTimeout(() => {
				resetPage();
				console.log("watchGameState : setTimeout")
			}, 5000);
			timeoutArr = timeoutArr.concat([timeout]);
		}
	}

	async function fetchMatchList()
	{
		matchList = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/game/match/all`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("All matchs not retrieved");
			}
			return response.json();
		})
		.then((body) => {
			return body;
		})
		.catch((error) => { 
			console.log("catch fetchMatchList: ", error);
			return [];
		});
	};

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
<!--  -->

<!-- <div id="game_page"> Replacement for <body>.
	Might become useless after CSS rework. -->
<div id="game_page" class={game_page_class}>

	{#if !hiddenGame}
		{#if gameState.matchEnded}
			<div class="div_game" in:fly="{{ y: 10, duration: 1000 }}">
				<p>The match is finished !</p>
			</div>
		{/if}
	{/if}

	<div id="canvas_container" hidden={hiddenGame}>
		<canvas id={gameAreaId}/>
	</div>

	{#if !hiddenGame}
		<div class="div_game">
			<img class="avatar" src="{playerOneAvatar}" alt="player one avatar">
			'{gameState.playerOneUsername}' VS '{gameState.playerTwoUsername}'
			<img class="avatar" src="{playerTwoAvatar}" alt="player two avatar">
		</div>

		{#if !gameState.matchEnded}
			<div class="div_game">
				<button class="pong_button margin_top" on:click={leaveMatch}>leave</button>
			</div>
		{/if}
	{/if}

<!--  -->

	{#if hiddenGame}
		<div class="div_game game_options" in:fly="{{ y: 10, duration: 1000 }}">
			<fieldset>
				<legend>options</legend>
				<button class="pong_button" on:click={fetchMatchList}>Reload</button>

				<div>
					sound :
					<label for="sound_on">
						<input type="radio" id="sound_on" name="sound_selector" bind:group={sound} value="on">
						on
					</label>
					<label for="sound_off">
						<input type="radio" id="sound_off" name="sound_selector" bind:group={sound} value="off">
						off
					</label>
				</div>

			</fieldset>
			{#if matchList.length !== 0}
				<!-- <menu id="match_list"> -->
					{#each matchList as match}
						<MatchOngoingElem match={match} on:click={(e) => initGameSpectator(match)} />
						<br>
					{/each}
				<!-- </menu> -->
			{:else}
				<p>no match ongoing</p>
			{/if}
		</div>
	{/if}

<div id="preload_font">.</div>

</div> <!-- div "game_page" -->

<!--  -->
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

/* Possible rollback, demander à Hugo */
/* #game_page {
	margin: 0;
	padding: 20px;
	position: relative;
	width: 100%;
	height: 100%;
	box-sizing: border-box;
} */
#game_page {
	margin: 0;
	position: relative;
	width: 100%;
	height: auto;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
}

.game_options {
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
/* #match_list {
	text-align: center;
} */
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
