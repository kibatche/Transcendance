
import { Vector, VectorInteger } from "../../shared_js/class/Vector.js";
import type { GraphicComponent } from "../../shared_js/class/interface.js";
import { Rectangle, MovingRectangle, Racket, Ball } from "../../shared_js/class/Rectangle.js";
import { muteFlag, soundPongArr } from "../audio.js"
import { random } from "../utils.js";

function updateRectangle(this: RectangleClient) {
	this.ctx.fillStyle = this.color;
	this.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
}

function clearRectangle(this: RectangleClient, pos?: VectorInteger) {
	if (pos)
		this.ctx.clearRect(pos.x, pos.y, this.width, this.height);
	else
		this.ctx.clearRect(this.pos.x, this.pos.y, this.width, this.height);
}

export class RectangleClient extends Rectangle implements GraphicComponent {
	ctx: CanvasRenderingContext2D;
	color: string;
	update: () => void;
	clear: (pos?: VectorInteger) => void;
	constructor(pos: VectorInteger, width: number, height: number,
			ctx: CanvasRenderingContext2D, color: string)
	{
		super(pos, width, height);
		this.ctx = ctx;
		this.color = color;
		this.update = updateRectangle;
		this.clear = clearRectangle;
	}
}

export class MovingRectangleClient extends MovingRectangle implements GraphicComponent {
	ctx: CanvasRenderingContext2D;
	color: string;
	update: () => void;
	clear: (pos?: VectorInteger) => void;
	constructor(pos: VectorInteger, width: number, height: number, baseSpeed: number,
			ctx: CanvasRenderingContext2D, color: string)
	{
		super(pos, width, height, baseSpeed);
		this.ctx = ctx;
		this.color = color;
		this.update = updateRectangle;
		this.clear = clearRectangle;
	}
}

export class RacketClient extends Racket implements GraphicComponent {
	ctx: CanvasRenderingContext2D;
	color: string;
	update: () => void;
	clear: (pos?: VectorInteger) => void;
	constructor(pos: VectorInteger, width: number, height: number, baseSpeed: number,
			ctx: CanvasRenderingContext2D, color: string)
	{
		super(pos, width, height, baseSpeed);
		this.ctx = ctx;
		this.color = color;
		this.update = updateRectangle;
		this.clear = clearRectangle;
	}
}

export class BallClient extends Ball implements GraphicComponent {
	ctx: CanvasRenderingContext2D;
	color: string;
	update: () => void;
	clear: (pos?: VectorInteger) => void;
	soundSwitch = false;
	constructor(pos: VectorInteger, size: number, baseSpeed: number, speedIncrease: number,
		ctx: CanvasRenderingContext2D, color: string)
	{
		super(pos, size, baseSpeed, speedIncrease);
		this.ctx = ctx;
		this.color = color;
		this.update = updateRectangle;
		this.clear = clearRectangle;
	}
	bounce(collider?: Rectangle) {
		this._bounceAlgo(collider);
		if (!muteFlag)
		{
			this.soundSwitch = !this.soundSwitch;
			soundPongArr[this.soundSwitch ? 1 : 0].play();
			// let i = Math.floor(random(0, soundPongArr.length));
			// soundPongArr[ i ].play();
			// console.log(`sound_i=${i}`); // debug log
		}
	}
}

function updateLine(this: Line) {
	this.ctx.fillStyle = this.color;
	let pos: VectorInteger = new VectorInteger;
	let i = 0;
	while (i < this.segmentCount)
	{
		/* Horizontal Line */
		// pos.y = this.pos.y;
		// pos.x = this.pos.x + this.segmentWidth * i;

		/* Vertical Line */
		pos.x = this.pos.x;
		pos.y = this.pos.y + this.segmentHeight * i;

		this.ctx.fillRect(pos.x, pos.y, this.segmentWidth, this.segmentHeight);
		i += 2;
	}
}

export class Line extends RectangleClient {
	gapeCount: number = 0;
	segmentCount: number;
	segmentWidth: number;
	segmentHeight: number;
	constructor(pos: VectorInteger, width: number, height: number,
			ctx: CanvasRenderingContext2D, color: string, gapeCount?: number)
	{
		super(pos, width, height, ctx, color);
		this.update = updateLine;
		if (gapeCount)
			this.gapeCount = gapeCount;
		this.segmentCount = this.gapeCount * 2 + 1;

		/* Vertical Line */
		this.segmentWidth = this.width;
		this.segmentHeight = this.height / this.segmentCount;

		/* Horizontal Line */
		// this.segmentWidth = this.width / this.segmentCount;
		// this.segmentHeight = this.height;
	}
}
