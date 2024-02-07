<script lang="ts">

  import { onMount } from "svelte";
	import Button from "../../pieces/Button.svelte";
	import DisplayAUser from "../../pieces/DisplayAUser.svelte";
	import Tabs from "../../pieces/Tabs.svelte";
	import { fetchUser, fetchAllUsers, fetchAvatar } from "../../pieces/utils";

	import { clickOutside } from '../../pieces/clickOutside'
    import { push } from "svelte-spa-router";

  let user;
	let allUsers = [];
	let myFriendships = [];
	let requestsMade, requestsRecieved;
	let blockedUsers = [];
	let usernameBeingViewed;
	let friendshipStatusFull; // date, reveiverUsername, status

	/**** Layout variables ****/
	let tabItems: string[] = [
		"All Users",
		"My Friends",
		"Friend Requests",
		"Blocked Users",
	];
	let activeTabItem: string = "All Users";
  let loadedUser;

	let showModal = false;



	onMount(async () => {
		user = await fetchUser();

		fetchAll();
	});

  const fetchAll = async () => {
		// no need to await i think it can load in the background
		fetchAllUsers_Wrapper();
		fetchMyFriendships();
		fetchRequestsMade();
		fetchRequestsReceived();
		fetchBlockedUsers();
	};

	/*****  Fetch basic things  *****/
	const fetchAllUsers_Wrapper = async () => {
		allUsers = await fetchAllUsers();
		if (usernameBeingViewed) {
			let found = allUsers.find(
				(e) => e.username === usernameBeingViewed
			);
			if (!found) {
				usernameBeingViewed = null;
				friendshipStatusFull = null;
			}
		}
	};

// it's more like fetch friendships
	// then i need to extract the users
	const fetchMyFriendships = async () => {
		myFriendships = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/myfriends`)
		.then((response) => {
			if (!response.ok) {
        if (response.status === 404)
          return []
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchMyFriendships: ", error);
			return [];
		});
	};

	const fetchRequestsMade = async () => {
		requestsMade = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/pending`)
		.then((response) => {
			if (!response.ok) {
        if (response.status === 404)
          return []
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchRequestsMade: ", error);
			return [];
		});
	};

  const fetchRequestsReceived = async () => {
		requestsRecieved = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/received`)
		.then((response) => {
			if (!response.ok) {
        if (response.status === 404)
          return []
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchRequestsReceived: ", error);
			return [];
		});
	};

	const fetchBlockedUsers = async () => {
		blockedUsers = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/blocked`)
		.then((response) => {
			if (!response.ok) {
        if (response.status === 404)
          return []
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchBlockedUsers: ", error);
			return [];
		});
	};
	/**** END OF MAIN FETCH ****/

  // returns everything but BLOCKED
  const fetchFriendshipFull = async (aUsername) => {
		friendshipStatusFull = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/myfriends?username=${aUsername}`)
		.then((response) => {
			if (!response.ok) {
        if (response.status === 404)
          return []
				throw new Error("HTTP " + response.status);
      }
			return response.json();
		})
		.catch((error) => {
			console.log("catch fetchFriendshipFull: ", error);
			return [];
		});
	};

  const sendFriendRequest = async (aUsername) => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/relations`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					receiverUsername: aUsername,
					status: "R",
				}),
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch sendFriendRequest: ", error);
		});

		await fetchFriendshipFull(aUsername);
		await fetchAll();
	};

	const viewAUser = async (aUsername) => {
		usernameBeingViewed = aUsername;
		await fetchFriendshipFull(aUsername);
		showModal = true;
	};

	const unViewAUser = () => {
		showModal = false;
	}

  const acceptFriendRequest = async (relationshipId) => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/relations/${relationshipId}/accept`,
			{
				method: "PATCH",
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch acceptFriendRequest: ", error);
		});

		await fetchFriendshipFull(usernameBeingViewed);
		await fetchAll();
		activeTabItem = activeTabItem;
	};

  const declineFriendRequest = async (relationshipId) => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/relations/${relationshipId}/decline`,
			{
				method: "PATCH",
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch declineFriendRequest: ", error);
		});

		await fetchFriendshipFull(usernameBeingViewed);
		await fetchAll();
		activeTabItem = activeTabItem;
	};

  const unfriend = async (relationshipId) => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/relations/${relationshipId}`,
			{
				method: "DELETE",
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch unfriend: ", error);
		});

		await fetchFriendshipFull(usernameBeingViewed);
		if (Object.keys(friendshipStatusFull).length === 0) {
			friendshipStatusFull = null;
		}

		await fetchAll();
		activeTabItem = activeTabItem;
	};

  const blockANonFriendUser = async (aUsername) => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/relations`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					receiverUsername: aUsername,
					status: "B",
				}),
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch blockANonFriendUser: ", error);
		});

		await fetchAll();
		usernameBeingViewed = null;
		friendshipStatusFull = null;

		activeTabItem = activeTabItem;
	};

  const blockAFriend = async (relationshipId) => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/network/relations/${relationshipId}/block`,
			{
				method: "PATCH"
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => { 
			console.log("catch blockAFriend: ", error);
		});

		await fetchAll();
		usernameBeingViewed = null;
		friendshipStatusFull = null;

		// reloads active tab so you get blocked users for example
		activeTabItem = activeTabItem;
	};

  const unblockAUser = async (relationshipId) => {
		// it's basically the same as unfriending someone cuz unfriending them means the relationship is deleted
		await unfriend(relationshipId);
    await fetchAll();
		activeTabItem = activeTabItem;
	};

  const switchTab = async (e) => {
		activeTabItem = e.detail;
		if (activeTabItem === "All Users") {
			await fetchAllUsers_Wrapper();
		} else if (activeTabItem === "My Friends") {
			await fetchMyFriendships();
		} else if (activeTabItem === "Friend Requests") {
			await fetchRequestsReceived();
		} else if (activeTabItem === "Blocked Users") {
			await fetchBlockedUsers();
			console.log("fetching blocked users");
		}
		if (usernameBeingViewed) {
      await fetchAllUsers_Wrapper();
			fetchFriendshipFull(usernameBeingViewed);
    }
	};

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="top-grid">

  <div class="sidebar-list background-pages">
    <Tabs items={tabItems} activeItem={activeTabItem} size="default" on:tabChange={switchTab}/>
    {#if activeTabItem === 'All Users' && allUsers}
      {#if Object.keys(allUsers).length === 0}
        <div class="tip">You are alone on this platform...</div>
      {/if}
      {#each allUsers as aUser}
				<div class="user" on:click={() => viewAUser(aUser.username)}>
					{#await fetchAvatar(aUser.username) then avatar}
						<img class="avatar sidebar-item" src="{avatar}" alt="user avatar">
					{:catch error}
						<p class="error">Avatar was unable to load</p>
					{/await}
					<div class="sidebar-item">{aUser.username}</div>
					<div class="status sidebar-item">{aUser.status}</div>
				</div>
        <br>
      {/each}
    {:else if activeTabItem === 'My Friends' && myFriendships}
      {#if Object.keys(myFriendships).length === 0}
        <div class="tip">You don't have any Friends... Yet!</div>
      {/if}
      {#each myFriendships as aFriendship}
					{#if aFriendship.senderUsername !== user.username}
						<div class="user" on:click={() => viewAUser(aFriendship.senderUsername)}>
							{#await fetchAvatar(aFriendship.senderUsername) then avatar}
								<img class="avatar sidebar-item" src="{avatar}" alt="user avatar">
							{:catch error}
								<p class="error">Avatar was unable to load</p>
							{/await}
							<div class="sidebar-item">{aFriendship.senderUsername}</div>
						</div>
					{:else if aFriendship.receiverUsername !== user.username}
						<div class="user" on:click={() => viewAUser(aFriendship.receiverUsername)}>
							{#await fetchAvatar(aFriendship.receiverUsername) then avatar}
								<img class="avatar sidebar-item" src="{avatar}" alt="user avatar">
							{:catch error}
								<p class="error">Avatar was unable to load</p>
							{/await}
							<div class="sidebar-item">{aFriendship.receiverUsername}</div>
						</div>
					{/if}
        <br>
      {/each}
    {:else if activeTabItem === 'Friend Requests' && requestsRecieved}
      {#if Object.keys(requestsRecieved).length === 0}
        <div class="tip">You don't have any Friend Requests</div>
      {/if}
      {#each requestsRecieved as aUser}
				<div class="user" on:click={() => viewAUser(aUser.senderUsername)}>
					{#await fetchAvatar(aUser.senderUsername) then avatar}
						<img class="avatar sidebar-item" src="{avatar}" alt="user avatar">
					{:catch error}
						<p class="error">Avatar was unable to load</p>
					{/await}
					<div class="sidebar-item">{aUser.senderUsername}</div>
					<div class="status sidebar-item">{aUser.status}</div>
				</div>
        <br>
      {/each}
    {:else if activeTabItem === 'Blocked Users' && blockedUsers}
      {#if Object.keys(blockedUsers).length === 0}
        <div class="tip">You have not Blocked any Users</div>
      {/if}
      {#each blockedUsers as aUser}
				<div class="user" on:click={() => viewAUser(aUser.receiverUsername)}>
					{#await fetchAvatar(aUser.receiverUsername) then avatar}
						<img class="avatar sidebar-item" src="{avatar}" alt="user avatar">
					{:catch error}
						<p class="error">Avatar was unable to load</p>
					{/await}
					<div class="sidebar-item">{aUser.receiverUsername}</div>
					<div class="status sidebar-item">{aUser.status}</div>
				</div>
        <br>
      {/each}
    {/if}
  </div>


	{#if showModal && usernameBeingViewed}
	<div class="backdrop"></div>
  <div class="box background-pages" use:clickOutside on:outclick={() => unViewAUser()}>
      <DisplayAUser aUsername={usernameBeingViewed} bind:loaded={loadedUser}/>

      {#if loadedUser === true}
      <div class="buttons-area">
        {#if friendshipStatusFull && friendshipStatusFull.id}
          {#if friendshipStatusFull.status === 'R'}
            {#if friendshipStatusFull.senderUsername === user.username}
              <div class="tile">Friend Request Sent</div>
            {:else}
              <Button type="secondary" on:click={() => acceptFriendRequest(friendshipStatusFull.id)}>Accept Friend Request</Button>
              <Button on:click={() => declineFriendRequest(friendshipStatusFull.id)}>Decline Friend Request</Button>
            {/if}
            <Button on:click={() => blockAFriend(friendshipStatusFull.id)}>Block User</Button>
          {:else if friendshipStatusFull.status === 'A'}
            <div class="tile">You are Friends</div>
            <Button on:click={() => unfriend(friendshipStatusFull.id)}>Unfriend</Button>
            <Button on:click={() => blockAFriend(friendshipStatusFull.id)}>Block User</Button>
          {:else if friendshipStatusFull.status === 'D'}
            {#if friendshipStatusFull.senderUsername === user.username}
              <div class="tile">Your friend request was declined, hang in there bud.</div>
            {:else}
              <div class="tile">You declined the friend request, but you could still change your mind</div>
              <Button on:click={() => acceptFriendRequest(friendshipStatusFull.id)}>Accept Friend Request</Button>
            {/if}
            <Button on:click={() => blockAFriend(friendshipStatusFull.id)}>Block User</Button>
          {:else if friendshipStatusFull.status === 'B'}
            {#if friendshipStatusFull.senderUsername === user.username}
              <Button on:click={() => unblockAUser(friendshipStatusFull.id)}>Unblock User</Button>
            {/if}
          {/if}
        {:else}
          <Button type="secondary" on:click={() => sendFriendRequest(usernameBeingViewed)}>Add Friend</Button>
          <Button on:click={() => blockANonFriendUser(usernameBeingViewed)}>Block User</Button>
        {/if}
      </div>
      {/if}
			<button on:click={() => push(`/profile/users/${usernameBeingViewed}`)}>Profile Page</button>
			<button on:click={() => unViewAUser()}>Close</button>
  </div>
	{/if}
</div>


<style>

	div.sidebar-list{
    background: #FB8B24;
    padding: 1vw;
    font-size: smaller;
    max-width: 100%;
    max-height: 100%;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    border-right: 4px solid #071013;
    border-bottom: 4px solid #071013;
    overflow-wrap: break-word;
		text-align: center;
  }

  div.sidebar-item{
    display: inline-block;
		text-align: center;
  }

  div.status{
    font-size: 0.6em;
    font-weight: bold;
  }

  /* selector attributes to get only divs with .a-user */
  /* you gotta be careful with Svelte cuz it tacks classes on to the end of basically all elems! */
  div[class^="sidebar-item"]:hover{
    text-decoration: underline;
    font-weight: bold;
    cursor: pointer;
  }

	/* Modal Stuff */

	.backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0,0,0,0.50)
  }

	.box {
		--width: 70vw;
		--height: 60vh;
		position: absolute;
		width: var(--width);
		/* height: var(--height); */
		height: auto;
		left: calc(50% - var(--width) / 2);
		top: calc(50% - var(--height) / 2);
		align-items: center;
		padding: 8px;
		border: 2px solid white;
		border-radius: 7px;
		text-align: center;
		font-weight: bold;
	}

  div.buttons-area{
    text-align: center;
  }

  div.tip{
    color: white;
    font-size: 0.8em;
    font-weight: bold;
  }

	img.avatar {
		width: 60px;
	}

	div.user {
		cursor: pointer;
	}

	div.tile {
		margin: 5px;
	}

	.error{
    font-size: 0.5em;
    font-weight: bold;
    color: rgb(152, 20, 20);
  }
	
</style>
