
import * as en from "../../shared_js/enums.js"
import { GameComponents } from "../../shared_js/class/GameComponents.js";

export class GameComponentsServer extends GameComponents {
	scoreLeft: number = 0;
	scoreRight: number = 0;
	constructor(options: en.MatchOptions)
	{
		super(options);
	}
}
