<script lang="ts">

	import { history, add_history, settings_user } from './Store_chat';
	import { list_block_user } from './Request_rooms';
	import { User } from './Types_chat';
	import { to_print } from './Utils_chat';
	import Button from './Element_button.svelte';

	let users: User[] = list_block_user();

	async function user_profile(room_user: string)
	{
		to_print("in user_profile");
		await settings_user.set(room_user);
		add_history("user");
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- settings -->
	<Button my_class="room_name deactivate">
		settings
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- panel_settings -->
	<div class="panel panel_settings __border_top">
		<p>blocked users :</p>
		<div class="blocked_users">
			<div class="__show_if_only_child">
				<p class="__center">/ you have blocked no one /</p>
			</div>
			{#await users}
				<p>list of users is loading...</p>
			{:then users}
				{#each users as user}
					<Button my_class="list blocked" on:click={function(){user_profile(user)}}>
						{user.name}
					</Button>
				{/each}
			{/await}
		</div>
	</div>

</div>

<style>

	/* grid layout "settings"
	*/
	.grid_box :global(.back          ) {grid-area: back;}
	.grid_box :global(.settings      ) {grid-area: settings;}
	.grid_box :global(.close         ) {grid-area: close;}
	.grid_box :global(.panel_settings) {grid-area: panel_settings;}
	.grid_box {
		grid:
			' back            settings        close           ' auto
			' panel_settings  panel_settings  panel_settings  ' 1fr
			/ auto            1fr             auto            ;
	}


</style>


