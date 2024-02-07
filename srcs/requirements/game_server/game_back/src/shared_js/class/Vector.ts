
export class Vector {
	x: number;
	y: number;
	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}
	assign(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	normalized() : Vector {
		const normalizationFactor = Math.abs(this.x) + Math.abs(this.y);
		return new Vector(this.x/normalizationFactor, this.y/normalizationFactor);
	}
}

export class VectorInteger extends Vector {
	// PLACEHOLDER
	// VectorInteger with set/get dont work (No draw on the screen). Why ?
}

/* 
export class VectorInteger {
	// private _x: number = 0;
	// private _y: number = 0;
	// constructor(x: number = 0, y: number = 0) {
	// 	this._x = x;
	// 	this._y = y;
	// }
	// get x(): number {
	// 	return this._x;
	// }
	// set x(v: number) {
	// 	// this._x = Math.floor(v);
	// 	this._x = v;
	// }
	// get y(): number {
	// 	return this._y;
	// }
	// set y(v: number) {
	// 	// this._y = Math.floor(v);
	// 	this._y = v;
	// }
}
*/
