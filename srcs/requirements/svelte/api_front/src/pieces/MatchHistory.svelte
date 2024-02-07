
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fetchAvatar } from "./utils.js";
	import type { MatchHistory } from "./Match";

	export let user;
	let matchList: MatchHistory[] = [];

	onMount( async() => {
		matchList = await fetchMatchList(user.username);
		console.log(matchList);
		// matchList = await mockMatchList(user.username);
	})

	async function fetchMatchList(username: string)
	{
		let url = `http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/game/match/history?username=${username}`;
		return fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error("HTTP " + response.status);
				}
				return response.json();
			})
			.catch((error) => { 
				console.log("catch fetchMatchList: ", error);
				return [];
			});
	}

	async function mockMatchList(username?: string)
	{
		return [
			{
				playerOneUsername: "hulamy",
				playerTwoUsername: "lperrey",
				playerOneResult: 5,
				playerTwoResult: 11,
				date: new Date()
			},
			{
				playerOneUsername: "hulamy",
				playerTwoUsername: "lperrey",
				playerOneResult: 14,
				playerTwoResult: 12,
				date: new Date()
			},
			{
				playerOneUsername: "hulamy",
				playerTwoUsername: "lperrey",
				playerOneResult: 0,
				playerTwoResult: 0,
				date: new Date()
			},
			{
				playerOneUsername: "hulamy",
				playerTwoUsername: "lperrey",
				playerOneResult: 3,
				playerTwoResult: 0,
				date: new Date()
			},
		]
	}
</script>

<br />
<div class="background-pages">
<div class="principal-div">
	<table class="stats-table">
		<thead>
			<tr>
				<th>#</th>
				<th>Player One</th>
				<th></th>
				<th>VS</th>
				<th></th>
				<th>Player Two</th>
				<th>Result</th>
			</tr>
		</thead>
		<tbody>
			{#each matchList as match, i}
				<tr>
					<th>{i + 1}</th>
					{#await fetchAvatar(match.playerOneUsername) then avatar}
						<td>
							<img class="avatar" src="{avatar}" alt="avatarOne">
							<br>
							{match.playerOneUsername}
						</td>
					{/await}
					<td>{match.playerOneResult}</td>
					<td>VS</td>
					<td>{match.playerTwoResult}</td>
					{#await fetchAvatar(match.playerTwoUsername) then avatar}
						<td>
							<img class="avatar" src="{avatar}" alt="avatarTwo">
							<br>
							{match.playerTwoUsername}
						</td>
					{/await}
					{#if match.playerOneResult === match.playerTwoResult}
						<th>DRAW</th>
					{:else if (user.username === match.playerOneUsername && match.playerOneResult > match.playerTwoResult)
					|| (user.username === match.playerTwoUsername && match.playerTwoResult > match.playerOneResult)}
						<th>WIN</th>
					{:else}
						<th>LOSE</th>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
</div>

<style>

	.avatar {
		width: 3vw;
		height: 3vw;
	}

	.principal-div {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.stats-table {
		margin-left: auto;
		margin-right: auto;
		font-size: 1vw;
		min-width: 400px;
	}

	.stats-table thead tr {
		background-color: #618174;
		color: #ffffff;
	}

	.stats-table th,
	.stats-table td {
		padding: 12px 15px;
		size: 10vw;
		max-width: 10vw;
		overflow-wrap: break-word;
	}

	.stats-table tbody tr {
		border-bottom: 1px solid #dddddd;
	}

	.stats-table tbody tr:nth-of-type(even) {
		background-color: #555;
	}

	.stats-table tbody tr:last-of-type {
		border-bottom: 2px solid #618174;
	}
</style>

