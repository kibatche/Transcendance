
import * as c from "./constants.js"
import * as en from "../shared_js/enums.js"
import { GameArea } from "./class/GameArea.js";
import { GameComponentsClient } from "./class/GameComponentsClient.js";
import { socket, gameState } from "./ws.js";
import { initAudio } from "./audio.js";
import type { InitOptions } from "./class/InitOptions.js";

import { pong } from "./global.js"
import { setPong, setGc, setMatchOptions } from "./global.js"

export function computeMatchOptions(options: InitOptions)
{
	let matchOptions = en.MatchOptions.noOption;

	if (options.multi_balls === true) {
		matchOptions |= en.MatchOptions.multiBalls
	}
	if (options.moving_walls === true) {
		matchOptions |= en.MatchOptions.movingWalls
	}

	return matchOptions;
}

export function initBase(matchOptions: en.MatchOptions, sound: string, gameAreaId: string)
{
	initAudio(sound);
	setMatchOptions(matchOptions);
	setPong(new GameArea(gameAreaId));
	setGc(new GameComponentsClient(matchOptions, pong.ctx));
}

export function destroyBase()
{
	if (socket && (socket.OPEN || socket.CONNECTING)) {
		socket.close();
	}
	if (pong)
	{
		pong.timeoutArr.forEach((value) => {
			clearTimeout(value);
		});
		pong.timeoutArr = [];

		clearInterval(pong.handleInputInterval);
		pong.handleInputInterval = null;

		clearInterval(pong.gameLoopInterval);
		pong.gameLoopInterval = null;

		clearInterval(pong.drawLoopInterval);
		pong.drawLoopInterval = null;

		setPong(null);
	}
	setGc(null);
	setMatchOptions(null);
	gameState.resetGameState();
}
