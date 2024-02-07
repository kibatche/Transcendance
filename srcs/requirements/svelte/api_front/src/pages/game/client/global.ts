
import * as en from "../shared_js/enums.js";
import type { GameArea } from "./class/GameArea.js";
import type { GameComponentsClient } from "./class/GameComponentsClient.js";

export let pong: GameArea;
export let gc: GameComponentsClient;
export let matchOptions: en.MatchOptions = en.MatchOptions.noOption;

export function setPong(value: GameArea) {
	pong = value;
}

export function setGc(value: GameComponentsClient) {
	gc = value;
}

export function setMatchOptions(value: en.MatchOptions) {
	matchOptions = value;
}

export let startFunction: () => void;

export function setStartFunction(value: () => void) {
	startFunction = value;
}
