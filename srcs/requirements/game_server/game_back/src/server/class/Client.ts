
import { WebSocket } from "../wsServer.js";
import { Racket } from "../../shared_js/class/Rectangle.js";
import { GameSession } from "./GameSession.js";
import * as ev from "../../shared_js/class/Event.js"
import * as en from "../../shared_js/enums.js"

export class Client {
	role: en.ClientRole;
	socket: WebSocket;
	id: string; // same as "socket.id"
	isAlive: boolean = true;
	gameSession: GameSession = null;
	constructor(socket: WebSocket, id: string) {
		this.socket = socket;
		this.id = id;
	}
}

export class ClientPlayer extends Client {
	token: string;
	username: string;
	matchOptions: en.MatchOptions = 0;
	inputBuffer: ev.EventInput = new ev.EventInput();
	lastInputId: number = 0;
	racket: Racket;
	constructor(socket: WebSocket, id: string) {
		super(socket, id);
	}
}

export class ClientSpectator extends Client {
	constructor(socket: WebSocket, id: string) {
		super(socket, id);
	}
}
