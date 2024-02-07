
import type * as en from "../../shared_js/enums.js"
import type * as ev from "../../shared_js/class/Event.js"

export class InputHistory {
	input: en.InputEnum;
	id: number;
	deltaTime: number;
	constructor(inputState: ev.EventInput, deltaTime: number) {
		this.input = inputState.input;
		this.id = inputState.id;
		this.deltaTime = deltaTime;
	}
}
