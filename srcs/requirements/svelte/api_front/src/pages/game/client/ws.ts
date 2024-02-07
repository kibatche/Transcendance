
import * as c from "./constants.js"
import { gc, matchOptions, startFunction } from "./global.js"
import * as ev from "../shared_js/class/Event.js"
import * as en from "../shared_js/enums.js"
import * as msg from "./message.js";
import type { RacketClient } from "./class/RectangleClient.js";
import { repeatInput } from "./handleInput.js";
import { muteFlag, soundRoblox } from "./audio.js"
import { sleep } from "./utils.js";
import { Vector, VectorInteger } from "../shared_js/class/Vector.js";

class GameState {
	matchStarted: boolean;
	matchEnded: boolean;
	matchAborted: boolean;
	playerOneUsername: string;
	playerTwoUsername: string;
	constructor() {
		this.resetGameState();
	}
	resetGameState() {
		this.matchStarted = false;
		this.matchEnded = false;
		this.matchAborted = false;
		this.playerOneUsername = "";
		this.playerTwoUsername = "";
	}
}

class ClientInfo {
	id = "";
	side: en.PlayerSide;
	racket: RacketClient;
	opponent: RacketClient;
	opponentNextPos: VectorInteger;
}

class ClientInfoSpectator {
	// side: en.PlayerSide;
	/* WIP: playerLeftNextPos and playerRightNextPos could be in clientInfo for simplicity */
	playerLeftNextPos: VectorInteger;
	playerRightNextPos: VectorInteger;
}

const wsUrl = "ws://" + process.env.WEBSITE_HOST + ":" + process.env.WEBSITE_PORT + "/pong";
export let socket: WebSocket;
export const gameState = new GameState();
export const clientInfo = new ClientInfo();
export const clientInfoSpectator = new ClientInfoSpectator(); // WIP, could refactor this


export function initWebSocket(options: en.MatchOptions, token: string, username: string, privateMatch = false, playerTwoUsername?: string, isInvitedPerson? : boolean)
{
	socket = new WebSocket(wsUrl, "json");
	console.log("Infos from ws.ts : options => " + options + " token => " + token + " username => " + username + " priavte match => " +  privateMatch
	 + " player two => " + playerTwoUsername)
	socket.addEventListener("open", (event) => {
		if (privateMatch) {
			socket.send(JSON.stringify( new ev.ClientAnnouncePlayer(options, token, username, privateMatch, playerTwoUsername, isInvitedPerson) ));
		}
		else {
			socket.send(JSON.stringify( new ev.ClientAnnouncePlayer(options, token, username) ));
		}
	});
	// socket.addEventListener("message", logListener); // for testing purpose
	socket.addEventListener("message", errorListener);
	socket.addEventListener("message", preMatchListener);
}

function logListener(this: WebSocket, event: MessageEvent) {
	console.log("%i: " + event.data, Date.now());
}

function errorListener(this: WebSocket, event: MessageEvent) {
	const data: ev.ServerEvent = JSON.parse(event.data);
	if (data.type === en.EventTypes.error) {
		console.log("actual Error");
		msg.error((data as ev.EventError).message);
	}
}

function preMatchListener(this: WebSocket, event: MessageEvent)
{
	const data: ev.ServerEvent = JSON.parse(event.data);
	switch (data.type) {
		case en.EventTypes.assignId:
			clientInfo.id = (<ev.EventAssignId>data).id;
			break;
		case en.EventTypes.matchmakingInProgress:
			msg.matchmaking();
			break;
		case en.EventTypes.matchmakingComplete:
			clientInfo.side = (<ev.EventMatchmakingComplete>data).side;
			gameState.playerOneUsername = (<ev.EventMatchmakingComplete>data).playerOneUsername;
			gameState.playerTwoUsername = (<ev.EventMatchmakingComplete>data).playerTwoUsername;
			if (clientInfo.side === en.PlayerSide.left)
			{
				clientInfo.racket = gc.playerLeft;
				clientInfo.opponent = gc.playerRight;
			}
			else if (clientInfo.side === en.PlayerSide.right)
			{
				clientInfo.racket = gc.playerRight;
				clientInfo.opponent = gc.playerLeft;
			}
			clientInfo.opponentNextPos = new VectorInteger(clientInfo.opponent.pos.x, clientInfo.opponent.pos.y);
			clientInfo.racket.color = "darkgreen"; // for testing purpose
			socket.send(JSON.stringify( new ev.ClientEvent(en.EventTypes.clientPlayerReady) )); // TODO: set an interval/timeout to resend until matchStart response (in case of network problem)
			msg.matchmakingComplete();
			break;
		case en.EventTypes.matchStart:
			gameState.matchStarted = true;
			socket.removeEventListener("message", preMatchListener);
			socket.addEventListener("message", inGameListener);
			startFunction();
			break;
		case en.EventTypes.matchAbort:
			gameState.matchAborted = true;
			socket.removeEventListener("message", preMatchListener);
			msg.matchAbort();
			break;
	}
}

function inGameListener(this: WebSocket, event: MessageEvent)
{
	const data: ev.ServerEvent = JSON.parse(event.data);
	switch (data.type) {
		case en.EventTypes.gameUpdate:
			// setTimeout(gameUpdate, 500, data as ev.EventGameUpdate); // artificial latency for testing purpose
			gameUpdate(data as ev.EventGameUpdate);
			break;
		case en.EventTypes.scoreUpdate:
			scoreUpdate(data as ev.EventScoreUpdate);
			break;
		case en.EventTypes.matchEnd:
			matchEnd(data as ev.EventMatchEnd);
			break;
	}
}

function gameUpdate(data: ev.EventGameUpdate)
{
	console.log("gameUpdate");

	if (matchOptions & en.MatchOptions.movingWalls) {
		gc.wallTop.pos.y = data.wallTop.y;
		gc.wallBottom.pos.y = data.wallBottom.y;
	}

	data.ballsArr.forEach((ball, i) => {
		gc.ballsArr[i].pos.assign(ball.x, ball.y);
		gc.ballsArr[i].dir.assign(ball.dirX, ball.dirY);
		gc.ballsArr[i].speed = ball.speed;
	});
	/* // Equivalent to
	gc.ballsArr.forEach((ball, i) => {
		ball.pos.assign(data.ballsArr[i].x, data.ballsArr[i].y);
		ball.dir.assign(data.ballsArr[i].dirX, data.ballsArr[i].dirY);
		ball.speed = data.ballsArr[i].speed;
	}); */

	const predictionPos = new VectorInteger(clientInfo.racket.pos.x, clientInfo.racket.pos.y); // debug

	if (clientInfo.side === en.PlayerSide.left) {
		clientInfo.racket.pos.assign(clientInfo.racket.pos.x, data.playerLeft.y);
	}
	else if (clientInfo.side === en.PlayerSide.right) {
		clientInfo.racket.pos.assign(clientInfo.racket.pos.x, data.playerRight.y);
	}

	// interpolation
	clientInfo.opponent.pos.assign(clientInfo.opponentNextPos.x, clientInfo.opponentNextPos.y);
	if (clientInfo.side === en.PlayerSide.left) {
		clientInfo.opponentNextPos.assign(clientInfo.opponent.pos.x, data.playerRight.y);
	}
	else if (clientInfo.side === en.PlayerSide.right) {
		clientInfo.opponentNextPos.assign(clientInfo.opponent.pos.x, data.playerLeft.y);
	}

	clientInfo.opponent.dir = new Vector(
		clientInfo.opponentNextPos.x - clientInfo.opponent.pos.x,
		clientInfo.opponentNextPos.y - clientInfo.opponent.pos.y
	);

	if (Math.abs(clientInfo.opponent.dir.x) + Math.abs(clientInfo.opponent.dir.y) !== 0) {
		clientInfo.opponent.dir = clientInfo.opponent.dir.normalized();
	}

	// server reconciliation
	repeatInput(data.lastInputId);

	// debug
	if (clientInfo.racket.pos.y > predictionPos.y + 1
	||  clientInfo.racket.pos.y < predictionPos.y - 1)
	{
		console.log(
			`Reconciliation error:
			server y:         ${data.playerLeft.y}
			reconciliation y: ${clientInfo.racket.pos.y}
			prediction y:     ${predictionPos.y}`
			);
	}
}

function scoreUpdate(data: ev.EventScoreUpdate)
{
	// console.log("scoreUpdate");
	if (!muteFlag)
	{
		if (clientInfo.side === en.PlayerSide.left && data.scoreRight > gc.scoreRight.value) {
			soundRoblox.play();
		}
		else if (clientInfo.side === en.PlayerSide.right && data.scoreLeft > gc.scoreLeft.value) {
			soundRoblox.play();
		}
	}
	gc.scoreLeft.value = data.scoreLeft;
	gc.scoreRight.value = data.scoreRight;
}

function matchEnd(data: ev.EventMatchEnd)
{
	gameState.matchEnded = true;
	socket.close();
	if (data.winner === clientInfo.side) {
		msg.win();
		if (data.forfeit) {
			msg.forfeit(clientInfo.side);
		}
	}
	else {
		msg.lose();
	}
}

/* Spectator */

export function initWebSocketSpectator(gameSessionId: string)
{
	socket = new WebSocket(wsUrl, "json");
	socket.addEventListener("open", (event) => {
		socket.send(JSON.stringify( new ev.ClientAnnounceSpectator(gameSessionId) ));
	});
	// socket.addEventListener("message", logListener); // for testing purpose
	socket.addEventListener("message", errorListener);
	socket.addEventListener("message", preMatchListenerSpectator);

	clientInfoSpectator.playerLeftNextPos = new VectorInteger(gc.playerLeft.pos.x, gc.playerLeft.pos.y);
	clientInfoSpectator.playerRightNextPos = new VectorInteger(gc.playerRight.pos.x, gc.playerRight.pos.y);

}

export function preMatchListenerSpectator(this: WebSocket, event: MessageEvent)
{
	const data: ev.ServerEvent = JSON.parse(event.data);
	if (data.type === en.EventTypes.matchStart)
	{
		gameState.matchStarted = true;
		socket.removeEventListener("message", preMatchListenerSpectator);
		socket.addEventListener("message", inGameListenerSpectator);
		socket.send(JSON.stringify( new ev.ClientEvent(en.EventTypes.clientSpectatorReady) ));
		startFunction();
	}
}

function inGameListenerSpectator(this: WebSocket, event: MessageEvent)
{
	const data: ev.ServerEvent = JSON.parse(event.data);
	switch (data.type) {
		case en.EventTypes.gameUpdate:
			gameUpdateSpectator(data as ev.EventGameUpdate);
			break;
		case en.EventTypes.scoreUpdate:
			scoreUpdateSpectator(data as ev.EventScoreUpdate);
			break;
		case en.EventTypes.matchEnd:
			matchEndSpectator(data as ev.EventMatchEnd);
			break;
	}
}

function gameUpdateSpectator(data: ev.EventGameUpdate)
{
	console.log("gameUpdateSpectator");

	if (matchOptions & en.MatchOptions.movingWalls) {
		gc.wallTop.pos.y = data.wallTop.y;
		gc.wallBottom.pos.y = data.wallBottom.y;
	}

	data.ballsArr.forEach((ball, i) => {
		gc.ballsArr[i].pos.assign(ball.x, ball.y);
		gc.ballsArr[i].dir.assign(ball.dirX, ball.dirY);
		gc.ballsArr[i].speed = ball.speed;
	});

	// interpolation
	for (const racket of [gc.playerLeft, gc.playerRight])
	{
		let nextPos: VectorInteger;
		if (racket === gc.playerLeft) {
			nextPos = clientInfoSpectator.playerLeftNextPos;
		}
		else {
			nextPos = clientInfoSpectator.playerRightNextPos;
		}

		racket.pos.assign(nextPos.x, nextPos.y);
		if (racket === gc.playerLeft) {
			nextPos.assign(racket.pos.x, data.playerLeft.y);
		}
		else {
			nextPos.assign(racket.pos.x, data.playerRight.y);
		}

		racket.dir = new Vector(
			nextPos.x - racket.pos.x,
			nextPos.y - racket.pos.y
		);

		if (Math.abs(racket.dir.x) + Math.abs(racket.dir.y) !== 0) {
			racket.dir = racket.dir.normalized();
		}
	}
}

function scoreUpdateSpectator(data: ev.EventScoreUpdate)
{
	console.log("scoreUpdateSpectator");
	gc.scoreLeft.value = data.scoreLeft;
	gc.scoreRight.value = data.scoreRight;
}

function matchEndSpectator(data: ev.EventMatchEnd)
{
	console.log("matchEndSpectator");
	gameState.matchEnded = true;
	socket.close();
}

