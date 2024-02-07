
import { pong, gc } from "./global.js"
import { socket, clientInfo, gameState } from "./ws.js"
import * as ev from "../shared_js/class/Event.js"
import * as en from "../shared_js/enums.js"
import { InputHistory }  from "./class/InputHistory.js"
import * as c from "./constants.js";

export let gridDisplay = false;

let actual_time: number = Date.now();
let last_time: number;
let delta_time: number;

const inputState: ev.EventInput = new ev.EventInput();
const inputHistoryArr: InputHistory[] = [];

// test
/* export function sendLoop()
{
	socket.send(JSON.stringify(inputState));
} */

export function handleInput()
{
	/* last_time = actual_time;
	actual_time = Date.now();
	delta_time = (actual_time - last_time) / 1000; */

	delta_time = c.fixedDeltaTime;
	// console.log(`delta_time: ${delta_time}`);

	inputState.id = Date.now();
	inputState.input = en.InputEnum.noInput;

	const keys = pong.keys;
	if (keys.length !== 0)
	{
		if (keys.indexOf("g") != -1)
		{
			gridDisplay = !gridDisplay;
			pong.deleteKey("g");
		}
		playerMovements(delta_time, keys);
	}

	if (!gameState.matchEnded) {
		socket.send(JSON.stringify(inputState));
	}
	// setTimeout(testInputDelay, 100);
	inputHistoryArr.push(new InputHistory(inputState, delta_time));

	// client prediction
	if (inputState.input !== en.InputEnum.noInput) {
		// TODO: peut-etre le mettre dans game loop ?
		// Attention au delta time dans ce cas !
		playerMovePrediction(delta_time, inputState.input);
	}
}

function playerMovements(delta: number, keys: string[])
{
	if (keys.indexOf("w") !== -1 || keys.indexOf("ArrowUp".toLowerCase()) !== -1)
	{
		if (keys.indexOf("s") === -1 && keys.indexOf("ArrowDown".toLowerCase()) === -1) {
			inputState.input = en.InputEnum.up;
		}
	}
	else if (keys.indexOf("s") !== -1 || keys.indexOf("ArrowDown".toLowerCase()) !== -1) {
		inputState.input = en.InputEnum.down;
	}
}

function testInputDelay() {
	socket.send(JSON.stringify(inputState));
}


function playerMovePrediction(delta: number, input: en.InputEnum)
{
	// client prediction
	const racket = clientInfo.racket;
	if (input === en.InputEnum.up) {
		racket.dir.y = -1;
	}
	else if (input === en.InputEnum.down) {
		racket.dir.y = 1;
	}
	racket.moveAndCollide(delta, [gc.wallTop, gc.wallBottom]);
}

export function repeatInput(lastInputId: number)
{
	// server reconciliation
	let i = inputHistoryArr.findIndex((value: InputHistory) => {
		if (value.id === lastInputId) {
			return true;
		}
		return false;
	});

	// console.log(`inputHistory total: ${inputHistoryArr.length}` );
	inputHistoryArr.splice(0, i+1);
	// console.log(`inputHistory left: ${inputHistoryArr.length}` );
	
	inputHistoryArr.forEach((value: InputHistory) => {
		if (value.input !== en.InputEnum.noInput) {
			playerMovePrediction(value.deltaTime, value.input);
		}
	});
}
