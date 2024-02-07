
import * as c from "./constants.js"

// export const soundPongArr: HTMLAudioElement[] = [];
export let muteFlag: boolean;
export const soundPongArr: HTMLAudioElement[] = [];
export let soundRoblox: HTMLAudioElement;

export function initAudio(sound: string)
{
	soundPongArr.length = 0;
	soundRoblox = null;

	if (sound === "on") {
		muteFlag = false;
	}
	else {
		muteFlag = true;
		return; // Could be changed
		/*
			Stop initAudio() here because in the current state of the game
			there no way to change muteFlag after game start.
			If it becomes an option,
			we should continue initAudio() regardless of the muteFlag.
		*/
	}

	soundPongArr.push(new Audio("http://" + process.env.WEBSITE_HOST  + ":" + process.env.WEBSITE_PORT + "/sound/pong/"+1+".ogg"));
	soundPongArr.push(new Audio("http://" + process.env.WEBSITE_HOST  + ":" + process.env.WEBSITE_PORT + "/sound/pong/"+2+".ogg"));
	soundPongArr.forEach((value) => {
		value.volume = c.soundRobloxVolume;
		value.muted = muteFlag;
	});

	soundRoblox = new Audio("http://" + process.env.WEBSITE_HOST  + ":" + process.env.WEBSITE_PORT + "/sound/roblox-oof.ogg");
	soundRoblox.volume = c.soundRobloxVolume;
	soundRoblox.muted = muteFlag;
}
