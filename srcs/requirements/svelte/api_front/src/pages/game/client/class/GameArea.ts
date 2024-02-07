
import * as c from ".././constants.js"

export class GameArea {
	keys: string[] = [];
	handleInputInterval: number = 0;
	gameLoopInterval: number = 0;
	drawLoopInterval: number = 0;
	timeoutArr: number[] = [];
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	constructor(canvas_id: string) {
		const canvas = document.getElementById("game_area");
		if (canvas && canvas instanceof HTMLCanvasElement) {
			this.canvas = canvas;
		}
		else {
			console.log("GameArea init error, invalid canvas_id");
			return;
		}
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.canvas.width = c.CanvasWidth;
		this.canvas.height = c.CanvasWidth / c.CanvasRatio;
	}
	addKey(key: string) {
		key = key.toLowerCase();
		var i = this.keys.indexOf(key);
		if (i == -1)
			this.keys.push(key);
	}
	deleteKey(key: string) {
		key = key.toLowerCase();
		var i = this.keys.indexOf(key);
		if (i != -1) {
			this.keys.splice(i, 1);
		}
	}
	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
