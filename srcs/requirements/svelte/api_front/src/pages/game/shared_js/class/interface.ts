
import type { Vector, VectorInteger } from "./Vector.js";

export interface Component {
	pos: VectorInteger;
}

export interface GraphicComponent extends Component {
	ctx: CanvasRenderingContext2D;
	color: string;
	update: () => void;
	clear: (pos?: VectorInteger) => void;
}

export interface Moving {
	dir: Vector;
	speed: number; // pixel per second
	move(delta: number): void;
}
