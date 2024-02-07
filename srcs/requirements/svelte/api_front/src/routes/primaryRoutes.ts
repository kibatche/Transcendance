import NotFound from "../pages/NotFound.svelte";
import ProfilePage from "../pages/profile/ProfilePage.svelte";
import SplashPage from "../pages/SplashPage.svelte";
import TwoFactorAuthentication from '../pages/TwoFactorAuthentication.svelte';
import UnauthorizedAccessPage from '../pages/UnauthorizedAccessPage.svelte';
import { wrap } from 'svelte-spa-router/wrap'
import Game from '../pages/game/Game.svelte';
import Ranking from '../pages/game/Ranking.svelte';
import GameSpectator from '../pages/game/GameSpectator.svelte';
import { fetchUser } from "../pieces/utils";

async function checkLogin(detail) {
	const user = await fetchUser();
	if (!user || !user.username) {
		return false;
	}
	else {
		return true;
	}
}

export const primaryRoutes = {
	'/': SplashPage,
	'/2fa': TwoFactorAuthentication,
	'/game': wrap({
		component: Game,
		conditions: [checkLogin]
	}),
	'/spectator': wrap({
		component: GameSpectator,
		conditions: [checkLogin]
	}),
	'/ranking': wrap({
		component: Ranking,
		conditions: [checkLogin]
	}),
	'/profile': wrap({
		component: ProfilePage,
		conditions: [checkLogin]
	}),
	'/profile/*': wrap({
		component: ProfilePage,
		conditions: [checkLogin]
	}),
	'/unauthorized-access': UnauthorizedAccessPage,
	'*': NotFound
};
