<script lang="ts">

	import { layout, history }      from './Store_chat';
	import ChatBox         from './Chat_box_css.svelte';

	import CloseLayout     from './Layout_close.svelte';
	import HomeLayout      from './Layout_home.svelte';
	import RoomLayout      from './Layout_room.svelte';
	import NewLayout       from './Layout_new.svelte';
	import SettingsLayout  from './Layout_settings.svelte';
	import RoomsetLayout   from './Layout_room_set.svelte';
	import PasswordLayout  from './Layout_password.svelte';
	import CreateLayout    from './Layout_create.svelte';
	import MuteLayout      from './Layout_mute.svelte';
	import UserLayout      from './Layout_user.svelte';
	import InviteLayout    from './Layout_invite.svelte';

	import Button from './Element_button.svelte';

	/* global variables
	*/
	let room = "";
	let admin = false;

	$:	{
				$layout = $history[0];
				console.log($history);
			}

</script>

<ChatBox>

	{#if $layout === "home"}
		<HomeLayout />

	{:else if $layout === "close"}
		<CloseLayout />

	{:else if $layout === "room"}
		<RoomLayout />

	{:else if $layout === "new"}
		<NewLayout />

	{:else if $layout === "settings"}
		<SettingsLayout />

	{:else if $layout === "room_set"}
		<RoomsetLayout />

	{:else if $layout === "password"}
		<PasswordLayout />

	{:else if $layout === "add_password"}
		<PasswordLayout mode="add" />

	{:else if $layout === "change_password"}
		<PasswordLayout mode="change" />

	{:else if $layout === "remove_password"}
		<PasswordLayout mode="remove" />

	{:else if $layout === "create"}
		<CreateLayout />

	{:else if $layout === "mute"}
		<MuteLayout  />

	{:else if $layout === "user"}
		<UserLayout />

	{:else if $layout === "invite"}
		<InviteLayout />

	{/if}

</ChatBox>

<style></style>

