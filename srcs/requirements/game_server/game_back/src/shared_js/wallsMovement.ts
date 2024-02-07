
import * as c from "./constants.js";
import type { MovingRectangle } from "../shared_js/class/Rectangle.js";
import type { GameComponents } from "./class/GameComponents.js";

export function wallsMovements(delta: number, gc: GameComponents)
{
	const wallTop = <MovingRectangle>gc.wallTop;
	const wallBottom = <MovingRectangle>gc.wallBottom;
	if (wallTop.pos.y <= 0 || wallTop.pos.y >= c.movingWallPosMax) {
		wallTop.dir.y *= -1;
	}
	if (wallBottom.pos.y >= c.h-c.wallSize || wallBottom.pos.y <= c.h-c.movingWallPosMax) {
		wallBottom.dir.y *= -1;
	}
	wallTop.moveAndCollide(delta, [gc.playerLeft, gc.playerRight]);
	wallBottom.moveAndCollide(delta, [gc.playerLeft, gc.playerRight]);
}
