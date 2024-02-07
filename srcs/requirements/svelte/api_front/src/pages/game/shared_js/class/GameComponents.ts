
import * as c from "../constants.js"
import * as en from "../../shared_js/enums.js"
import { VectorInteger } from "./Vector.js";
import { Rectangle, MovingRectangle, Racket, Ball } from "./Rectangle.js";
import { random } from "../utils.js";

export class GameComponents {
	wallTop: Rectangle | MovingRectangle;
	wallBottom: Rectangle | MovingRectangle;
	playerLeft: Racket;
	playerRight: Racket;
	ballsArr: Ball[] = [];
	constructor(options: en.MatchOptions)
	{
		const pos = new VectorInteger;

		// Rackets
		pos.assign(0+c.pw, c.h_mid-c.ph/2);
		this.playerLeft = new Racket(pos, c.pw, c.ph, c.racketSpeed);
		pos.assign(c.w-c.pw-c.pw, c.h_mid-c.ph/2);
		this.playerRight = new Racket(pos, c.pw, c.ph, c.racketSpeed);
	
		// Balls
		let ballsCount = 1;
		if (options & en.MatchOptions.multiBalls) {
			ballsCount = c.multiBallsCount;
		}
		pos.assign(-c.ballSize, -c.ballSize); // ball out =)
		while (this.ballsArr.length < ballsCount) {
			this.ballsArr.push(new Ball(pos, c.ballSize, c.ballSpeed, c.ballSpeedIncrease))
		}
		this.ballsArr.forEach((ball) => {
			ball.dir.x = 1;
			if (random() > 0.5) {
				ball.dir.x *= -1;
			}

			ball.dir.y = random(0, 0.2);
			if (random() > 0.5) {
				ball.dir.y *= -1;
			}

			ball.dir = ball.dir.normalized();
		});

		// Walls
		if (options & en.MatchOptions.movingWalls) {
			pos.assign(0, 0);
			this.wallTop = new MovingRectangle(pos, c.w, c.wallSize, c.movingWallSpeed);
			(<MovingRectangle>this.wallTop).dir.y = -1;
			pos.assign(0, c.h-c.wallSize);
			this.wallBottom = new MovingRectangle(pos, c.w, c.wallSize, c.movingWallSpeed);
			(<MovingRectangle>this.wallBottom).dir.y = 1;
		}
		else {
			pos.assign(0, 0);
			this.wallTop = new Rectangle(pos, c.w, c.wallSize);
			pos.assign(0, c.h-c.wallSize);
			this.wallBottom = new Rectangle(pos, c.w, c.wallSize);
		}
	}
}
