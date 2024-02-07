
import type { MatchOptions } from "../pages/game/client/pongSpectator";
export { MatchOptions } from "../pages/game/client/pongSpectator";

export class MatchOngoing {
	gameServerIdOfTheMatch: string;
	gameOptions: MatchOptions;
	playerOneUsername: string;
	playerTwoUsername: string;
}

export class MatchHistory {
	id: number;
	date: Date;
	playerOneUsername: string;
	playerTwoUsername: string;
	playerOneResult: number;
	playerTwoResult: number;
}
