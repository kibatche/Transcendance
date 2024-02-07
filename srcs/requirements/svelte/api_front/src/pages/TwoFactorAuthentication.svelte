<script lang="ts">
	import { push } from "svelte-spa-router";

	let qrCodeImg;
	let qrCode = "";
	let wrongCode = "";

	const fetchQrCodeImg = (async () => {
		qrCodeImg = await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/auth/2fa/generate`,
			{
				method: "POST",
			}
		)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
			return response.blob();
		})
		.then((blob) => {
			return URL.createObjectURL(blob);
		})
		.catch((error) => {
			console.log("catch fetchQrCodeImg: ", error);
		});

	})();

	const submitCode = async () => {
		await fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/auth/2fa/check`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					twoFaCode: qrCode,
				}),
			}
		)
		.then((response) => {
			if (!response.ok) {
				if (response.status === 401) {
					qrCode = "";
					wrongCode = `Wrong code`;
				}
				throw new Error("HTTP " + response.status);
			}
			push("/profile");
			console.log("valid Code for 2FA");
		})
		.catch((error) => { 
			console.log("catch submitCode: ", error);
		});
	};

</script>

<main>
  <h1>2FA Sign In</h1>
  <p>use google authenticator</p>
  {#await fetchQrCodeImg}
    <p>Please Wait...</p>
  {:then data}
    <img src={qrCodeImg} alt="A QRCodeImg you must scan with google authenticator" id="qrcodeImg" />
    <form on:submit|preventDefault={submitCode}>
      <input id="code" bind:value={qrCode} type="text" placeholder="Input Code"/>
      <button type="submit">Send</button>
    </form>
    {#if wrongCode}
      <div class="error">
        {wrongCode}
      </div>
    {/if}
  {:catch}
    <p>Unable to get QrCodeImg</p>
  {/await}
</main>

<style>
  main {
    text-align: center;
    padding-top: 40px;
    padding-bottom: 40px;
  }

  form {
    padding-top: 15px;
  }

  form input {
    max-width: 330px;
  }

  .error {
    font-weight: bold;
    font-size: 1vw;
    color: red;
  }
</style>
