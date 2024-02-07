
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fetchUser } from "../../pieces/utils";

	let user;
	let allUsersRanking = [];

	let fetchScoresInterval;

	onMount( async() => {
		user = await fetchUser();
		allUsersRanking = await fetchScores();

		fetchScoresInterval = setInterval(fetchScores, 10000);
	})

	onDestroy( async() => {
		clearInterval(fetchScoresInterval);
	})

	async function fetchScores()
	{
		return fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/game/ranking`)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchScores: ", error);
			return [];
		});
	}
</script>

<br />
<div class="background-pages">
<div class="principal-div">
	<table class="stats-table">
		<thead>
			<tr>
				<th>#</th>
				<th>Username</th>
				<th>Win</th>
				<th>Lose</th>
				<th>Draw</th>
				<th>Games Played</th>
			</tr>
		</thead>
		<tbody>
			{#each allUsersRanking as userRanking, i}
				<tr>
					<th>{i + 1}</th>
					{#if userRanking.username === user.username}
						<td><b>{userRanking.username} [You]</b></td>
					{:else}
						<td>{userRanking.username}</td>
					{/if}
					<td>{userRanking.stats.winGame}</td>
					<td>{userRanking.stats.loseGame}</td>
					<td>{userRanking.stats.drawGame}</td>
					<td>{userRanking.stats.totalGame}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
</div>

<style>

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
