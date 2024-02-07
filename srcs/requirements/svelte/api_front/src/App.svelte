<script lang="ts">
	import Router, { replace } from "svelte-spa-router";
	import { primaryRoutes } from "./routes/primaryRoutes.js";
	import { location } from 'svelte-spa-router';
	import Chat from './pieces/chat/Chat.svelte';
	import Header from './pieces/Header.svelte';
	import { showHeader } from './pieces/store_showHeader';

	const conditionsFailed = (event) => {
		console.error('conditionsFailed event', event.detail);
		// replace('/unauthorized-access');
		replace('/');
	};

</script>

{#if ($location !== '/' && $showHeader)}
	<Header/>
{/if}

<Chat />

<Router routes={primaryRoutes} on:conditionsFailed={conditionsFailed}/>

