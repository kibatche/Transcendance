
import * as c from "./constants.js"
import type * as en from "../shared_js/enums.js"
import { handleInput } from "./handleInput.js";
import { gameLoop } from "./gameLoop.js"
import { drawLoop } from "./draw.js";
import { countdown } from "./utils.js";
import { gameState, initWebSocket } from "./ws.js";
import type { InitOptions } from "./class/InitOptions.js";
export { InitOptions } from "./class/InitOptions.js";
import { initBase, destroyBase, computeMatchOptions } from "./init.js";
export { computeMatchOptions } from "./init.js";

import { pong, gc } from "./global.js"
import { setStartFunction } from "./global.js"

let abortControllerKeydown: AbortController;
let abortControllerKeyup: AbortController;

export function init(matchOptions: en.MatchOptions, options: InitOptions, gameAreaId: string, token: string)
{
	initBase(matchOptions, options.sound, gameAreaId);

	setStartFunction(start);
	if (options.isSomeoneIsInvited) {
		initWebSocket(matchOptions, token, options.playerOneUsername, true, options.playerTwoUsername, options.isInvitedPerson);
	}
	else {
		initWebSocket(matchOptions, token, options.playerOneUsername);
	}
}

export function destroy()
{
	destroyBase();
	if (abortControllerKeydown) {
		abortControllerKeydown.abort();
		abortControllerKeydown = null;
	}
	if (abortControllerKeyup) {
		abortControllerKeyup.abort();
		abortControllerKeyup = null;
	}
}

function start()
{
	gc.text1.pos.assign(c.w*0.5, c.h*0.75);
	const countdownArr = countdown(c.matchStartDelay, 1000, (count: number) => {
		gc.text1.clear();
		gc.text1.text = `${count/1000}`;
		gc.text1.update();
	}, start_after_countdown);
	pong.timeoutArr = pong.timeoutArr.concat(countdownArr);
}

function start_after_countdown()
{
	abortControllerKeydown = new AbortController();
	window.addEventListener(
		'keydown',
		(e) => {
			if (e.key === "ArrowUp" || e.key === "ArrowDown")
				e.preventDefault();
			pong.addKey(e.key);
		},
		{signal: abortControllerKeydown.signal}
	);

	abortControllerKeyup = new AbortController();
	window.addEventListener(
		'keyup',
		(e) => {
			if (e.key === "ArrowUp" || e.key === "ArrowDown")
				e.preventDefault();
			pong.deleteKey(e.key);
		},
		{signal: abortControllerKeyup.signal}
	);

	resume();
}

function resume()
{
	gc.text1.text = "";
	pong.handleInputInterval = window.setInterval(handleInput, c.handleInputIntervalMS);
	// pong.handleInputInterval = window.setInterval(sendLoop, c.sendLoopIntervalMS);
	pong.gameLoopInterval = window.setInterval(gameLoop, c.gameLoopIntervalMS);
	pong.drawLoopInterval = window.setInterval(drawLoop, c.drawLoopIntervalMS);
}

function pause() // unused
{
	clearInterval(pong.handleInputInterval);
	clearInterval(pong.gameLoopInterval);
	clearInterval(pong.drawLoopInterval);
}
