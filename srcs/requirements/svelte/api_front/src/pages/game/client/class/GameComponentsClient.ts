
import * as c from "../constants.js"
import * as en from "../../shared_js/enums.js"
import { Vector, VectorInteger } from "../../shared_js/class/Vector.js";
import { TextElem, TextNumericValue } from "./Text.js";
import { RectangleClient, MovingRectangleClient, RacketClient, BallClient, Line } from "./RectangleClient.js";
import { GameComponents } from "../../shared_js/class/GameComponents.js";
import type { MovingRectangle } from "../../shared_js/class/Rectangle.js";

class GameComponentsExtensionForClient extends GameComponents {
	wallTop: RectangleClient | MovingRectangleClient;
	wallBottom: RectangleClient | MovingRectangleClient;
	playerLeft: RacketClient;
	playerRight: RacketClient;
	ballsArr: BallClient[];
	constructor(options: en.MatchOptions, ctx: CanvasRenderingContext2D)
	{
		super(options);

		// Rackets
		const basePL = this.playerLeft;
		const basePR = this.playerRight;
		this.playerLeft = new RacketClient(
		basePL.pos, basePL.width, basePL.height, basePL.baseSpeed,
		ctx, "white");
		this.playerRight = new RacketClient(
		basePR.pos, basePR.width, basePR.height, basePR.baseSpeed,
		ctx, "white");

		// Balls
		const newBallsArr: BallClient[] = [];
		this.ballsArr.forEach((ball) => {
			newBallsArr.push(new BallClient(ball.pos, ball.width, ball.baseSpeed, ball.speedIncrease,
			ctx, "white")
			);
		});
		this.ballsArr = newBallsArr;

		// Walls
		if (options & en.MatchOptions.movingWalls)
		{
			const baseWT = <MovingRectangle>this.wallTop;
			const baseWB = <MovingRectangle>this.wallBottom;

			this.wallTop = new MovingRectangleClient(baseWT.pos, baseWT.width, baseWT.height, baseWT.baseSpeed,
			ctx, "grey");
			(<MovingRectangleClient>this.wallTop).dir.assign(baseWT.dir.x, baseWT.dir.y);
			
			this.wallBottom = new MovingRectangleClient(baseWB.pos, baseWB.width, baseWB.height, baseWB.baseSpeed,
			ctx, "grey");
			(<MovingRectangleClient>this.wallBottom).dir.assign(baseWB.dir.x, baseWB.dir.y);
		}
		else
		{
			const baseWT = this.wallTop;
			const baseWB = this.wallBottom;
			this.wallTop = new RectangleClient(baseWT.pos, baseWT.width, baseWT.height,
			ctx, "grey");
			this.wallBottom = new RectangleClient(baseWB.pos, baseWB.width, baseWB.height,
			ctx, "grey");
		}
	}
}

export class GameComponentsClient extends GameComponentsExtensionForClient {
	midLine: Line;
	scoreLeft: TextNumericValue;
	scoreRight: TextNumericValue;
	text1: TextElem;
	text2: TextElem;
	text3: TextElem;

	w_grid_mid: RectangleClient;
	w_grid_u1: RectangleClient;
	w_grid_d1: RectangleClient;
	h_grid_mid: RectangleClient;
	h_grid_u1: RectangleClient;
	h_grid_d1: RectangleClient;
	constructor(options: en.MatchOptions, ctx: CanvasRenderingContext2D)
	{
		super(options, ctx);
		let pos = new VectorInteger;
		// Scores
		pos.assign(c.w_mid-c.scoreSize*1.6, c.scoreSize*1.5);
		this.scoreLeft = new TextNumericValue(pos, c.scoreSize, ctx, "white");
		pos.assign(c.w_mid+c.scoreSize*1.1, c.scoreSize*1.5);
		this.scoreRight = new TextNumericValue(pos, c.scoreSize, ctx, "white");
		this.scoreLeft.value = 0;
		this.scoreRight.value = 0;
		
		// Text
		pos.assign(0, c.h_mid);
		this.text1 = new TextElem(pos, Math.floor(c.w/8), ctx, "white");
		this.text2 = new TextElem(pos, Math.floor(c.w/24), ctx, "white");
		this.text3 = new TextElem(pos, Math.floor(c.w/24), ctx, "white");
	
		// Dotted Midline
		pos.assign(c.w_mid-c.midLineSize/2, 0+c.wallSize);
		this.midLine = new Line(pos, c.midLineSize, c.h-c.wallSize*2, ctx, "white", 15);
	
		// Grid
		pos.assign(0, c.h_mid);
		this.w_grid_mid = new RectangleClient(pos, c.w, c.gridSize, ctx, "darkgreen");
		pos.assign(0, c.h/4);
		this.w_grid_u1 = new RectangleClient(pos, c.w, c.gridSize, ctx, "darkgreen");
		pos.assign(0, c.h-c.h/4);
		this.w_grid_d1 = new RectangleClient(pos, c.w, c.gridSize, ctx, "darkgreen");
		pos.assign(c.w_mid, 0);
		this.h_grid_mid = new RectangleClient(pos, c.gridSize, c.h, ctx, "darkgreen");
		pos.assign(c.w/4, 0);
		this.h_grid_u1 = new RectangleClient(pos, c.gridSize, c.h, ctx, "darkgreen");
		pos.assign(c.w-c.w/4, 0);
		this.h_grid_d1 = new RectangleClient(pos, c.gridSize, c.h, ctx, "darkgreen");
	}
}
