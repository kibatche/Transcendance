
import { WebSocketServer, WebSocket as BaseLibWebSocket } from "ws";

export class WebSocket extends BaseLibWebSocket {
	id?: string;
}

import { IncomingMessage } from "http";
import { v4 as uuidv4 } from 'uuid';

import * as en from "../shared_js/enums.js"
import * as ev from "../shared_js/class/Event.js"
import * as c from "./constants.js"
import { Client, ClientPlayer, ClientSpectator } from "./class/Client.js"
import { GameSession } from "./class/GameSession.js"
import { shortId } from "./utils.js";

const wsPort = 8042;
export const wsServer = new WebSocketServer<WebSocket>({host: "0.0.0.0", port: wsPort, path: "/pong"});
const clientsMap: Map<string, Client> = new Map; // socket.id/Client
const matchmakingMap: Map<string, ClientPlayer> = new Map; // socket.id/ClientPlayer (duplicates with clientsMap)
const privateMatchmakingMap: Map<string, ClientPlayer> = new Map; // socket.id/ClientPlayer (duplicates with clientsMap)
const gameSessionsMap: Map<string, GameSession> = new Map; // GameSession.id(url)/GameSession

wsServer.on("connection", serverConnectionListener);
wsServer.on("error", serverErrorListener);
wsServer.on("close", serverCloseListener);


function serverConnectionListener(socket: WebSocket, request: IncomingMessage)
{
	const id = uuidv4();
	const client = new Client(socket, id);
	clientsMap.set(id, client);
	socket.id = id;

	socket.on("pong", function heartbeat() {
		client.isAlive = true;
		console.log(`client ${shortId(client.id)} is alive`);
	});

	socket.on("close", function removeClient() {
		clientTerminate(client);
	});

	socket.on("error", function errorLog(this: WebSocket, err: Error) {
		console.log(`error socket ${shortId(this.id)}:`);
		console.log(`${err.name}: ${err.message}`);
		if (err.stack) {
			console.log(`err.stack: ${err.stack}`);
		}
	});

	socket.on("message", function messageLog(data: string) {
		try {
			const event: ev.ClientEvent = JSON.parse(data);
			if (event.type === en.EventTypes.clientInput) {
				return;
			}
		}
		catch (e) {}
		console.log("data: " + data);
	});

	socket.once("message", clientAnnounceListener);
}


async function clientAnnounceListener(this: WebSocket, data: string)
{
	try {
		const msg : ev.ClientAnnounce = JSON.parse(data);
		if (msg.type === en.EventTypes.clientAnnounce)
		{
			// BONUS: reconnection with msg.clientId ?
			if (msg.role === en.ClientRole.player)
			{
				const announce: ev.ClientAnnouncePlayer = <ev.ClientAnnouncePlayer>msg;
				const player = clientsMap.get(this.id) as ClientPlayer;
				player.role = msg.role;

				const body = {
					playerOneUsername: announce.username,
					playerTwoUsername: "",
					gameOptions: announce.matchOptions,
					isGameIsWithInvitation: announce.privateMatch,
					token: announce.token,
				};
				if (announce.privateMatch) {
					body.playerTwoUsername = announce.playerTwoUsername;
				}

				fetch(`${c.addressBackEnd}/game/gameserver/validate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body)
				})
				.then((response) => {
					if (!response.ok) {
						throw new Error("HTTP " + response.status);
					}
				})
				.catch((error) => { 
					console.log("catch /game/gameserver/validate: ", error);
					this.send(JSON.stringify( new ev.EventError("validate token error") ));
					clientTerminate(clientsMap.get(this.id));
					return;
				});

				player.matchOptions = announce.matchOptions;
				player.token = announce.token;
				player.username = announce.username;
				this.send(JSON.stringify( new ev.EventAssignId(this.id) )); // unused
				this.send(JSON.stringify( new ev.ServerEvent(en.EventTypes.matchmakingInProgress) ));
				if (announce.privateMatch) {
					if (announce.isInvitedPerson) {
						player.username = announce.playerTwoUsername;
					}
					privateMatchmaking(player);
				}
				else {
					publicMatchmaking(player);
				}
			}
			else if (msg.role === en.ClientRole.spectator)
			{
				const announce: ev.ClientAnnounceSpectator = <ev.ClientAnnounceSpectator>msg;
				const spectator = clientsMap.get(this.id) as ClientSpectator;
				spectator.role = msg.role;

				const gameSession = gameSessionsMap.get(announce.gameSessionId);
				if (!gameSession) {
					this.send(JSON.stringify( new ev.EventError("invalid gameSessionId") ));
					clientTerminate(clientsMap.get(this.id));
					return;
				}
				spectator.gameSession = gameSession;
				gameSession.spectatorsMap.set(spectator.id, spectator);
				spectator.socket.once("message", spectatorReadyConfirmationListener);
				this.send(JSON.stringify( new ev.ServerEvent(en.EventTypes.matchStart) ));
			}
		}
		else {
			console.log("Invalid ClientAnnounce");
		}
		return;
	}
	catch (e) {
		console.log("Invalid JSON (clientAnnounceListener)");
	}
	this.once("message", clientAnnounceListener);
}


function publicMatchmaking(player: ClientPlayer)
{
	const minPlayersNumber = 2;
	const maxPlayersNumber = 2;
	const matchOptions = player.matchOptions;

	const compatiblePlayers: ClientPlayer[] = [];
	compatiblePlayers.push(player);
	
	/* // Replace with this code to enable the possibility to play against self
	for (const [id, client] of matchmakingMap)
	{
		if (client.matchOptions === matchOptions)
		{
			compatiblePlayers.push(client);
			if (compatiblePlayers.length === maxPlayersNumber) {
				break;
			}
		}
	} */

	for (const [id, client] of matchmakingMap)
	{
		if (client.matchOptions === matchOptions && client.username !== player.username)
		{
			compatiblePlayers.push(client);
			if (compatiblePlayers.length === maxPlayersNumber) {
				break;
			}
		}
	}

	if (compatiblePlayers.length >= minPlayersNumber) {
		compatiblePlayers.forEach((client) => {
			matchmakingMap.delete(client.id);
		});
		createGameSession(compatiblePlayers, matchOptions);
	}
	else {
		matchmakingMap.set(player.id, player);
	}
}


function privateMatchmaking(player: ClientPlayer)
{
	const minPlayersNumber = 2;
	const maxPlayersNumber = 2;
	const matchOptions = player.matchOptions;

	const token = player.token;
	const compatiblePlayers: ClientPlayer[] = [];
	compatiblePlayers.push(player);
	for (const [id, client] of privateMatchmakingMap)
	{
		if (client.token === token)
		{
			compatiblePlayers.push(client);
			if (compatiblePlayers.length === maxPlayersNumber) {
				break;
			}
		}
	}

	if (compatiblePlayers.length >= minPlayersNumber) {
		compatiblePlayers.forEach((client) => {
			privateMatchmakingMap.delete(client.id);
		});
		createGameSession(compatiblePlayers, matchOptions);
	}
	else
	{
		privateMatchmakingMap.set(player.id, player);
		setTimeout(async function abortMatch() {
			if (!player.gameSession)
			{
				if (player.socket.OPEN) {
					player.socket.send(JSON.stringify( new ev.EventMatchAbort() ));
				}

				fetch(`${c.addressBackEnd}/game/gameserver/destroysession`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						token : player.token
					})
				})
				.then((response) => {
					if (!response.ok) {
						throw new Error("HTTP " + response.status);
					}
				})
				.catch((error) => {
					console.log("catch /game/gameserver/destroysession: ", error);
				});

				clientTerminate(player);
			}
		}, 60000);
	}
}


function createGameSession(playersArr: ClientPlayer[], matchOptions: en.MatchOptions)
{
	const id = uuidv4();
	const gameSession = new GameSession(id, matchOptions);
	gameSessionsMap.set(id, gameSession);

	playersArr.forEach((client) => {
		client.gameSession = gameSession;
		gameSession.playersMap.set(client.id, client);
		gameSession.unreadyPlayersMap.set(client.id, client);
		client.socket.once("message", playerReadyConfirmationListener);
	});
	
	let gameSessionPlayersIterator = gameSession.playersMap.values();
	const eventMatchmakingComplete = new ev.EventMatchmakingComplete(
		(<ClientPlayer>gameSessionPlayersIterator.next().value).username,
		(<ClientPlayer>gameSessionPlayersIterator.next().value).username
	);

	// REFACTORING: Not pretty, hardcoded two players.
	// Could be done in gameSession maybe ?
	gameSessionPlayersIterator = gameSession.playersMap.values();
	let player: ClientPlayer;
	player = (<ClientPlayer>gameSessionPlayersIterator.next().value);
	player.racket = gameSession.components.playerLeft;
	eventMatchmakingComplete.side = en.PlayerSide.left;
	player.socket.send(JSON.stringify( eventMatchmakingComplete ));

	player = (<ClientPlayer>gameSessionPlayersIterator.next().value);
	player.racket = gameSession.components.playerRight;
	eventMatchmakingComplete.side = en.PlayerSide.right;
	player.socket.send(JSON.stringify( eventMatchmakingComplete ));
	// REFACTORING

	setTimeout(function abortMatch() {
		if (gameSession.unreadyPlayersMap.size !== 0)
		{
			gameSessionsMap.delete(gameSession.id);
			gameSession.playersMap.forEach((client) => {
				client.socket.send(JSON.stringify( new ev.EventMatchAbort() ));
				client.gameSession = null;
				clientTerminate(client);
			});
		}
	}, 5000);
}


async function playerReadyConfirmationListener(this: WebSocket, data: string)
{
	try {
		const msg : ev.ClientEvent = JSON.parse(data);
		if (msg.type === en.EventTypes.clientPlayerReady)
		{
			const client = clientsMap.get(this.id);
			const gameSession = client.gameSession;
			gameSession.unreadyPlayersMap.delete(this.id);
			if (gameSession.unreadyPlayersMap.size === 0)
			{
				const gameSessionPlayersIterator = gameSession.playersMap.values();
				const body = {
					gameServerIdOfTheMatch : gameSession.id,
					gameOptions: gameSession.matchOptions,
					playerOneUsername: (<ClientPlayer>gameSessionPlayersIterator.next().value).username,
					playerTwoUsername: (<ClientPlayer>gameSessionPlayersIterator.next().value).username,
					playerOneUsernameResult : 0,
					playerTwoUsernameResult : 0
				};

				fetch(`${c.addressBackEnd}/game/gameserver/creategame`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body)
				})
				.then((response) => {
					if (!response.ok) {
						throw new Error("HTTP " + response.status);
					}
				})
				.catch((error) => {
					console.log("catch /game/gameserver/creategame: ", error);
					gameSessionsMap.delete(gameSession.id);
					gameSession.playersMap.forEach((client) => {
						client.socket.send(JSON.stringify( new ev.EventMatchAbort() ));
						client.gameSession = null;
						clientTerminate(client);
					});
					return;
				});

				gameSession.playersMap.forEach( (client) => {
					client.socket.send(JSON.stringify( new ev.ServerEvent(en.EventTypes.matchStart) ));
				});
				gameSession.start();
			}
		}
		else {
			console.log("Invalid playerReadyConfirmation");
		}
		return;
	}
	catch (e) {
		console.log("Invalid JSON (playerReadyConfirmationListener)");
	}
	this.once("message", playerReadyConfirmationListener);
}


export function clientInputListener(this: WebSocket, data: string)
{
	try {
		// const input: ev.ClientEvent = JSON.parse(data);
		const input: ev.EventInput = JSON.parse(data);
		if (input.type === en.EventTypes.clientInput)
		{
			const client = clientsMap.get(this.id) as ClientPlayer;
			client.inputBuffer = input;
			client.gameSession.instantInputDebug(client); // wip
		}
		else {
			console.log("Invalid clientInput");
		}
	}
	catch (e) {
		console.log("Invalid JSON (clientInputListener)");
	}
}

function spectatorReadyConfirmationListener(this: WebSocket, data: string)
{
	try {
		const msg : ev.ClientEvent = JSON.parse(data);
		if (msg.type === en.EventTypes.clientSpectatorReady)
		{
			const client = clientsMap.get(this.id);
			const gameSession = client.gameSession;
			const scoreUpdate = new ev.EventScoreUpdate(gameSession.components.scoreLeft, gameSession.components.scoreRight);
			this.send(JSON.stringify(scoreUpdate));
		}
		else {
			console.log("Invalid spectatorReadyConfirmation");
		}
		return;
	}
	catch (e) {
		console.log("Invalid JSON (spectatorReadyConfirmationListener)");
	}
	this.once("message", spectatorReadyConfirmationListener);
}

////////////
////////////

const pingInterval = setInterval( () => {
	let deleteLog = "";
	clientsMap.forEach( (client) => {
		if (!client.isAlive) {
			clientTerminate(client);
			deleteLog += ` ${shortId(client.id)} |`;
		}
		else {
			client.isAlive = false;
			client.socket.ping();
		}
	});

	if (deleteLog) {
		console.log(`Disconnected:${deleteLog}`);
	}
	console.log("gameSessionMap size: " + gameSessionsMap.size);
	console.log("clientsMap size: " + clientsMap.size);
	console.log("matchmakingMap size: " + matchmakingMap.size);
	console.log("privateMatchmakingMap size: " + privateMatchmakingMap.size);
	console.log("");
}, 4200);


export async function clientTerminate(client: Client)
{
	client.socket.terminate();
	if (client.gameSession)
	{
		client.gameSession.playersMap.delete(client.id);
		client.gameSession.spectatorsMap.delete(client.id);
		if (client.gameSession.playersMap.size === 0)
		{
			client.gameSession.destroy();
			gameSessionsMap.delete(client.gameSession.id);
		}
	}
	clientsMap.delete(client.id);
	if (matchmakingMap.has(client.id)) {
		matchmakingMap.delete(client.id);
	}
	else if (privateMatchmakingMap.has(client.id)) {
		privateMatchmakingMap.delete(client.id);
	}

	if (client.role === en.ClientRole.player)
	{
		const player = client as ClientPlayer;
		fetch(`${c.addressBackEnd}/game/gameserver/resetuserstatus`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({username: player.username})
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => {
			console.log("catch /game/gameserver/resetuserstatus: ", error);
		});
	}
}


function serverCloseListener()
{
	clearInterval(pingInterval);
}


function serverErrorListener(error: Error)
{
	console.log("Error: " + JSON.stringify(error));
}
