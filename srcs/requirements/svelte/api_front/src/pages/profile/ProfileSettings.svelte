<script lang="ts">

	import Card from '../../pieces/Card.svelte';
	import {onMount} from 'svelte';
	import { push } from 'svelte-spa-router';
	
	import Button from '../../pieces/Button.svelte';
	import { fetchUser, fetchAvatar } from "../../pieces/utils";

	let user;
	let avatar, newAvatar;
	let uploadAvatarSuccess = false;

	let set = { username: '', tfa: false };
	let nameTmp;
	const errors = { username: '', checkbox: '', avatar: ''};
	let success = {username: '', avatar: '' };

	onMount( async() => {
		user = await fetchUser();
		avatar = await fetchAvatar();

		if (!user) {
			console.log('User did not load, something more official should prolly happen')
		}
		nameTmp = user.username;

		set.tfa = user.isEnabledTwoFactorAuth;
	})

	const settingsHandler = async() =>
	{
		if ((set.username.trim() === '')) {
			set.username = user.username
		}
		errors.username = ''
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/user`,
			{
				method: 'PATCH',
				headers: {
				'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					"username": set.username,
					"isEnabledTwoFactorAuth": set.tfa
				})
			}
		)
		.then((response) => {
			if (!response.ok) {
				success.username = ''
				errors.username = "Max length : 50 . Use [a-zA-Z0-9] and - _ .";
				if (response.status === 409) {
					errors.username = `${set.username} is already in use, pick a different one.`;
				}
				throw new Error("HTTP " + response.status);
			}
			else {
				if (response.status === 200) {
					errors.username = ''
					success.username = "Your changes have been saved";
				}
				else if (response.status === 201) {
					push("/2fa");
				}
			}

		})
		.catch((error) => { 
			console.log("catch settingsHandler: ", error);
		});
	}

	const uploadAvatar = async() => {
		errors.avatar = '';
		if (!newAvatar) {
			errors.avatar = 'You need to pick a file.'
			return;
		}
		const data = new FormData();
		data.append("file", newAvatar[0]);


		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/user/avatar`,
			{
				method : 'POST',
				body : data,
			}
		)
		.then((response) => {
			if (!response.ok) {
				success.avatar = ''
				errors.avatar = response.statusText;
				throw new Error("HTTP " + response.status);
			}
			errors.avatar = ''
			uploadAvatarSuccess = true;
			success.avatar = 'Your avatar has been updated';
		})
		.catch((error) => { 
			console.log("catch uploadAvatar: ", error);
		});

		avatar = await fetchAvatar(user.username);
	}

	const deleteAccount = async() => {
		console.log("deleting account")
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/user`, {
			method: "DELETE",
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
			console.log("account deleted")
			push('/');
		})
		.catch((error) => { 
			console.log("catch unable to delete: ", error);
		});
	}

</script>


<main>
  <div class="background-pages">
  <h2>Look! You can change stuff</h2>
  <div class="cards">
    <Card>
      <form on:submit|preventDefault={settingsHandler}>
        <div class="form-field">
          <div class="label">New Username</div>
          <input type="text" placeholder="{nameTmp}" bind:value={set.username}>
		      <div class="success">{success.username}</div>
          <div class="error">{errors.username}</div>
        </div>
        <div class="form-field">
          <div class="label inline-check">Set Two Factor Authentication</div>
          <input class="inline-check" type="checkbox" bind:checked={set.tfa}>
          <div class="error">{errors.checkbox}</div>
        </div>
        <Button type="secondary">Update Settings</Button>
      </form>
    </Card>

    <Card>
      {#if avatar}
        <img class="avatar" src={avatar} alt="your avatar"/>
      {/if}
      <form on:submit|preventDefault={uploadAvatar}>
        <div class="form-field">
          <div class="label">Pick a new Avatar</div>
          <input type="file" bind:files={newAvatar}/>
          <div class="error">{errors.avatar}</div>
		  		<div class="success">{success.avatar}</div>
        </div>
        <Button type={!newAvatar ? "primary" : "secondary"}>Upload Avatar</Button>
      </form>
    </Card>
  </div>
  <Button type="primary" on:click={() => deleteAccount()}>Delete Account</Button>
</div>
</main>


<style>
  main {
    text-align: center;
  }

  div.cards{
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
		margin-bottom: 10px;
  }

  img {
    width: 60px;
  }

  form {
    text-align: center;
  }

  .form-field {
    padding: 10px;
	color: #333;
  }

  .label {
    font-weight: bold;
  }

  .inline-check{
    display: inline;
    color: #333;
  }

  .error{
    font-size: 1vw;
    font-weight: bold;
    color: red;
  }

  .success{
	font-size: 1vw;
    font-weight: bold;
    color: green;
  }

</style>
