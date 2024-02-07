
import * as c from "./constants.js"
import type * as en from "../shared_js/enums.js"
import { gameLoopSpectator } from "./gameLoop.js"
import { drawLoop } from "./draw.js";
import { initWebSocketSpectator } from "./ws.js";
import { initBase, destroyBase, computeMatchOptions } from "./init.js";
export { computeMatchOptions } from "./init.js";
export { MatchOptions } from "../shared_js/enums.js"

import { pong, gc } from "./global.js"
import { setStartFunction } from "./global.js"


export function init(matchOptions: en.MatchOptions, sound: string, gameAreaId: string, gameSessionId: string)
{
	initBase(matchOptions, sound, gameAreaId);

	setStartFunction(start);
	initWebSocketSpectator(gameSessionId);
}

export function destroy()
{
	destroyBase();
}

function start()
{
	resume();
}

function resume()
{
	pong.gameLoopInterval = window.setInterval(gameLoopSpectator, c.gameLoopIntervalMS);
	pong.drawLoopInterval = window.setInterval(drawLoop, c.drawLoopIntervalMS);
}

function pause() // unused
{
	clearInterval(pong.gameLoopInterval);
	clearInterval(pong.drawLoopInterval);
}
