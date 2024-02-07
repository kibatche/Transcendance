
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { MatchOngoing, MatchOptions} from "./Match";
	import { fetchAvatar } from "./utils.js";

	export let match: MatchOngoing;

	let matchOptionsString = "";

	onMount( async() => {
		if (match.gameOptions === MatchOptions.noOption) {
			matchOptionsString = "standard";
		}
		else {
			if (match.gameOptions & MatchOptions.multiBalls) {
				matchOptionsString += "multi balls";
			}
			if (match.gameOptions & MatchOptions.movingWalls) {
				if (matchOptionsString) { matchOptionsString += ", "; }
				matchOptionsString += "moving walls";
			}
		}
	})

</script>
<!--  -->

	<div>
		{#await fetchAvatar(match.playerOneUsername) then avatar}
			<img class="avatar" src="{avatar}" alt="avatarOne">
		{/await}
		<button on:click class="match_elem">
			'{match.playerOneUsername}' VS '{match.playerTwoUsername}'
			<br/>
			[{matchOptionsString}]
		</button>
		{#await fetchAvatar(match.playerTwoUsername) then avatar}
			<img class="avatar" src="{avatar}" alt="avatarTwo">
		{/await}
	</div>

<!--  -->
<style>

	.avatar {
		width: 3vw;
		height: 3vw;
		margin-bottom: -1vw;
	}

	.match_elem {
		margin: 1vw;
	}

</style>
