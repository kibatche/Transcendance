
import * as c from "./constants.js";
import * as en from "../shared_js/enums.js"
import { gc, matchOptions } from "./global.js";
import { clientInfo, clientInfoSpectator} from "./ws.js";
import { wallsMovements } from "../shared_js/wallsMovement.js";
import type { RacketClient } from "./class/RectangleClient.js";
import type { VectorInteger } from "../shared_js/class/Vector.js";

let actual_time: number = Date.now();
let last_time: number;
let delta_time: number;

export function gameLoop()
{
	/* last_time = actual_time;
	actual_time = Date.now();
	delta_time = (actual_time - last_time) / 1000; */

	delta_time = c.fixedDeltaTime;
	// console.log(`delta_gameLoop: ${delta_time}`);

	// interpolation
	// console.log(`dir.y: ${clientInfo.opponent.dir.y}, pos.y: ${clientInfo.opponent.pos.y}, opponentNextPos.y: ${clientInfo.opponentNextPos.y}`);
	if (clientInfo.opponent.dir.y != 0 ) {
		racketInterpolation(delta_time, clientInfo.opponent, clientInfo.opponentNextPos);
	}

	// client prediction
	gc.ballsArr.forEach((ball) => {
		ball.moveAndBounce(delta_time, [gc.wallTop, gc.wallBottom, gc.playerLeft, gc.playerRight]);
	});

	if (matchOptions & en.MatchOptions.movingWalls) {
		wallsMovements(delta_time, gc);
	}
}

export function gameLoopSpectator()
{
	delta_time = c.fixedDeltaTime;

	// interpolation
	if (gc.playerLeft.dir.y != 0 ) {
		racketInterpolation(delta_time, gc.playerLeft, clientInfoSpectator.playerLeftNextPos);
	}
	if (gc.playerRight.dir.y != 0 ) {
		racketInterpolation(delta_time, gc.playerRight, clientInfoSpectator.playerRightNextPos);
	}

	// client prediction
	gc.ballsArr.forEach((ball) => {
		ball.moveAndBounce(delta_time, [gc.wallTop, gc.wallBottom, gc.playerLeft, gc.playerRight]);
	});

	if (matchOptions & en.MatchOptions.movingWalls) {
		wallsMovements(delta_time, gc);
	}
}

function racketInterpolation(delta: number, racket: RacketClient, nextPos: VectorInteger)
{
	// interpolation
	racket.moveAndCollide(delta, [gc.wallTop, gc.wallBottom]);

	if ((racket.dir.y > 0 && racket.pos.y > nextPos.y)
	||  (racket.dir.y < 0 && racket.pos.y < nextPos.y))
	{
		racket.dir.y = 0;
		racket.pos.y = nextPos.y;
	}
}
