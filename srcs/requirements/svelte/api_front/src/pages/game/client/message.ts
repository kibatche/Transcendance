
import * as c from "./constants.js"
import { gc, pong } from "./global.js"
import * as en from "../shared_js/enums.js"

/*
	before game
*/
export function error(message: string)
{
	console.log("msg.error()");
	pong.clear();
	const text = "error: " + message;
	console.log(text);
	gc.text2.clear();
	gc.text2.pos.assign(c.w*0.2, c.h*0.5);
	gc.text2.text = text;
	gc.text2.update();
}

export function matchmaking()
{
	const text = "searching...";
	console.log(text);
	gc.text1.clear();
	gc.text1.pos.assign(c.w*0.2, c.h*0.5);
	gc.text1.text = text;
	gc.text1.update();
}

export function matchmakingComplete()
{
	const text = "match found !";
	console.log(text);
	gc.text1.clear();
	gc.text1.pos.assign(c.w*0.15, c.h*0.5);
	gc.text1.text = text;
	gc.text1.update();
}

export function matchAbort()
{
	const text = "match abort";
	console.log(text);
	gc.text1.clear();
	gc.text1.pos.assign(c.w*0.15, c.h*0.5);
	gc.text1.text = text;
	gc.text1.update();

	setTimeout(() => {
		gc.text2.pos.assign(c.w*0.44, c.h*0.6);
		gc.text2.text = "pardon =(";
		const oriSize = gc.text2.size;
		gc.text2.size = c.w*0.025;
		gc.text2.update();
		gc.text2.size = oriSize;
	}, 2500);
}


/*
	in game
*/
export function win()
{
	gc.text1.pos.assign(c.w*0.415, c.h*0.5);
	gc.text1.text = "WIN";
}

export function lose()
{
	gc.text1.pos.assign(c.w*0.383, c.h*0.5);
	gc.text1.text = "LOSE";
}

export function forfeit(playerSide: en.PlayerSide)
{
	if (playerSide === en.PlayerSide.left) {
		gc.text2.pos.assign(c.w*0.65, c.h*0.42);
		gc.text3.pos.assign(c.w*0.65, c.h*0.52);
	}
	else {
		gc.text2.pos.assign(c.w*0.09, c.h*0.42);
		gc.text3.pos.assign(c.w*0.09, c.h*0.52);
	}
	setTimeout(() => {
		gc.text2.text = "par forfait";
	}, 1500);
	setTimeout(() => {
		gc.text3.text = "calme ta joie";
	}, 3500);	
}
