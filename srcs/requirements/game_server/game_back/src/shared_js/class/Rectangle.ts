
import { Vector, VectorInteger } from "./Vector.js";
import type { Component, Moving } from "./interface.js";
import * as c from "../constants.js"

export class Rectangle implements Component {
	pos: VectorInteger;
	width: number;
	height: number;
	constructor(pos: VectorInteger, width: number, height: number) {
		this.pos = new VectorInteger(pos.x, pos.y);
		this.width = width;
		this.height = height;
	}
	collision(collider: Rectangle): boolean {
		const thisLeft = this.pos.x;
		const thisRight = this.pos.x + this.width;
		const thisTop = this.pos.y;
		const thisBottom = this.pos.y + this.height;
		const colliderLeft = collider.pos.x;
		const colliderRight = collider.pos.x + collider.width;
		const colliderTop = collider.pos.y;
		const colliderBottom = collider.pos.y + collider.height;
		if ((thisBottom < colliderTop)
		|| (thisTop > colliderBottom)
		|| (thisRight < colliderLeft)
		|| (thisLeft > colliderRight)) {
			return false;
		}
		else {
			return true;
		}
	}
}

export class MovingRectangle extends Rectangle implements Moving {
	dir: Vector = new Vector(0,0);
	speed: number;
	readonly baseSpeed: number;
	constructor(pos: VectorInteger, width: number, height: number, baseSpeed: number) {
		super(pos, width, height);
		this.baseSpeed = baseSpeed;
		this.speed = baseSpeed;
	}
	move(delta: number) { // Math.floor WIP until VectorInteger debug
		// console.log(`delta: ${delta}, speed: ${this.speed}, speed*delta: ${this.speed * delta}`);
		// this.pos.x += Math.floor(this.dir.x * this.speed * delta);
		// this.pos.y += Math.floor(this.dir.y * this.speed * delta);
		this.pos.x += this.dir.x * this.speed * delta;
		this.pos.y += this.dir.y * this.speed * delta;
	}
	moveAndCollide(delta: number, colliderArr: Rectangle[]) {
		this._moveAndCollideAlgo(delta, colliderArr);
	}
	protected _moveAndCollideAlgo(delta: number, colliderArr: Rectangle[]) {
		let oldPos = new VectorInteger(this.pos.x, this.pos.y);
		this.move(delta);
		if (colliderArr.some(this.collision, this)) {
			this.pos = oldPos;
		}
	}
}

export class Racket extends MovingRectangle {
	constructor(pos: VectorInteger, width: number, height: number, baseSpeed: number) {
		super(pos, width, height, baseSpeed);
	}
	moveAndCollide(delta: number, colliderArr: Rectangle[]) {
		// let oldPos = new VectorInteger(this.pos.x, this.pos.y); // debug
		this._moveAndCollideAlgo(delta, colliderArr);
		// console.log(`y change: ${this.pos.y - oldPos.y}`);
	}
}

export class Ball extends MovingRectangle {
	readonly speedIncrease: number;
	ballInPlay: boolean = false;
	constructor(pos: VectorInteger, size: number, baseSpeed: number, speedIncrease: number) {
		super(pos, size, size, baseSpeed);
		this.speedIncrease = speedIncrease;
	}
	moveAndBounce(delta: number, colliderArr: Rectangle[]) {
		this.move(delta);
		let i = colliderArr.findIndex(this.collision, this);
		if (i != -1)
		{
			this.bounce(colliderArr[i]);
			this.move(delta);
		}
	}
	bounce(collider?: Rectangle) {
		this._bounceAlgo(collider);
	}
	protected _bounceAlgo(collider?: Rectangle) {
		/* Could be more generic, but testing only Racket is enough,
		because in Pong collider can only be Racket or Wall. */
		if (collider instanceof Racket) {
			this._bounceRacket(collider);
		}
		else {
			this._bounceWall();
		}
	}
	protected _bounceWall() { // Should be enough for Wall
		this.dir.y = this.dir.y * -1;
	}
	protected _bounceRacket(racket: Racket) {
		this._bounceRacketAlgo(racket);
	}
	protected _bounceRacketAlgo(racket: Racket) {
		this.speed += this.speedIncrease;

		let x = this.dir.x * -1;

		const angleFactorDegree = 60;
		const angleFactor = angleFactorDegree / 90;
		const racketHalf = racket.height/2;
		const ballMid = this.pos.y + this.height/2;
		const racketMid = racket.pos.y + racketHalf;

		let impact = ballMid - racketMid;
		const horizontalMargin = racketHalf * 0.15;
		if (impact < horizontalMargin && impact > -horizontalMargin) {
			impact = 0;
		}
		else if (impact > 0) {
			impact = impact - horizontalMargin;
		}
		else if (impact < 0) {
			impact = impact + horizontalMargin;
		}

		let y = impact / (racketHalf - horizontalMargin) * angleFactor;

		this.dir.assign(x, y);
		// Normalize Vector (for consistency in speed independent of direction)
		if (c.normalizedSpeed) {
			this.dir = this.dir.normalized();
		}
		// console.log(`x: ${this.dir.x}, y: ${this.dir.y}`);
	}
}
