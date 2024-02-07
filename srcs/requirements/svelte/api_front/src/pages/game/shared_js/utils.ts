
import type { MovingRectangle } from "./class/Rectangle.js";

export function random(min: number = 0, max: number = 1) {
	return Math.random() * (max - min) + min;
}

export function sleep (ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(n: number, min: number, max: number) : number
{
	if (n < min)
		n = min;
	else if (n > max)
		n = max;
	return (n);
}

// Typescript hack, unused
export function assertMovingRectangle(value: unknown): asserts value is MovingRectangle {
	// if (value !== MovingRectangle) throw new Error("Not a MovingRectangle");
	return;
}
