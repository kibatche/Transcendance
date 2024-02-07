
import { Vector, VectorInteger } from "../../shared_js/class/Vector.js";
import type { Component } from "../../shared_js/class/interface.js";

// conflict with Text
export class TextElem implements Component {
	ctx: CanvasRenderingContext2D;
	pos: VectorInteger;
	color: string;
	size: number;
	font: string;
	text: string = "";
	constructor(pos: VectorInteger, size: number,
			ctx: CanvasRenderingContext2D, color: string, font: string = "Bit5x3")
	{
		// this.pos = Object.assign({}, pos); // create bug, Uncaught TypeError: X is not a function
		this.pos = new VectorInteger(pos.x, pos.y);
		this.size = size;
		this.ctx = ctx;
		this.color = color;
		this.font = font;
	}
	update() {
		this.ctx.font = this.size + "px" + " " + this.font;
		this.ctx.fillStyle = this.color;
		this.ctx.fillText(this.text, this.pos.x, this.pos.y);
	}
	clear() {
		// clear no very accurate for Text 
		// https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
		let textMetric = this.ctx.measureText(this.text);
		// console.log("textMetric.width = "+textMetric.width);
		// console.log("size = "+this.size);
		// console.log("x = "+this.pos.x);
		// console.log("y = "+this.pos.y);
		this.ctx.clearRect(this.pos.x - 1, this.pos.y-this.size + 1, textMetric.width, this.size);
		// +1 and -1 because float imprecision (and Math.floor() with VectorInteger dont work for the moment)
		// (or maybe its textMetric imprecision ?)
	}
}

export class TextNumericValue extends TextElem {
	private _value: number = 0;
	constructor(pos: VectorInteger, size: number,
			ctx: CanvasRenderingContext2D, color: string, font?: string)
	{
		super(pos, size, ctx, color, font);
	}
	get value() {
		return this._value;
	}
	set value(v: number) {
		this._value = v;
		this.text = v.toString();
	}
}
