
import * as en from "../../shared_js/enums.js"
import * as ev from "../../shared_js/class/Event.js"
import * as c from "../constants.js"
import { ClientPlayer, ClientSpectator } from "./Client";
import { GameComponentsServer } from "./GameComponentsServer.js";
import { clientInputListener, clientTerminate } from "../wsServer.js";
import { random } from "../utils.js";
import { Ball } from "../../shared_js/class/Rectangle.js";
import { wallsMovements } from "../../shared_js/wallsMovement.js";

/*
	multiples methods of GameSession have parameter "s: GameSession".
	its used with calls to setTimeout(),
	because "this" is not equal to the GameSession but to "this: Timeout"
*/
export class GameSession {
	id: string; // url ?
	playersMap: Map<string, ClientPlayer> = new Map();
	unreadyPlayersMap: Map<string, ClientPlayer> = new Map();
	spectatorsMap: Map<string, ClientSpectator> = new Map();
	gameLoopInterval: NodeJS.Timer | number = 0;
	playersUpdateInterval: NodeJS.Timer | number = 0;
	spectatorsUpdateInterval: NodeJS.Timer | number = 0;
	components: GameComponentsServer;
	matchOptions: en.MatchOptions;
	isPrivateMatch: boolean; // WIP: could be used to separate leaderboards for example.
	matchEnded: boolean = false;
	lastStateSnapshot: ev.EventGameUpdate;

	actual_time: number;
	last_time: number;
	delta_time: number;

	constructor(id: string, matchOptions: en.MatchOptions, isPrivateMatch: boolean = false) {
		this.id = id;
		this.matchOptions = matchOptions;
		this.isPrivateMatch = isPrivateMatch;
		this.components = new GameComponentsServer(this.matchOptions);
	}
	start() {
		const gc = this.components;
		setTimeout(this.resume, c.matchStartDelay, this);

		let timeout = c.matchStartDelay + c.newRoundDelay;
		gc.ballsArr.forEach((ball) => {
			setTimeout(this._newRound, timeout, this, ball);
			timeout += c.newRoundDelay*0.5;
		});
	}
	resume(s?: GameSession)
	{
		if (!s) { s = this; }

		s.playersMap.forEach( (client) => {
			client.socket.on("message", clientInputListener);
		});

		s.actual_time = Date.now();
		s.lastStateSnapshot = s._gameStateSnapshot();
		s.gameLoopInterval = setInterval(s._gameLoop, c.serverGameLoopIntervalMS, s);
		s.playersUpdateInterval = setInterval(s._playersUpdate, c.playersUpdateIntervalMS, s);
		s.spectatorsUpdateInterval = setInterval(s._spectatorsUpdate, c.spectatorsUpdateIntervalMS, s);
	}
	pause(s?: GameSession)
	{
		if (!s) { s = this; }

		s.playersMap.forEach( (client) => {
			client.socket.off("message", clientInputListener);
		});

		clearInterval(s.gameLoopInterval);
		clearInterval(s.playersUpdateInterval);
		clearInterval(s.spectatorsUpdateInterval);
	}
	destroy(s?: GameSession)
	{
		if (!s) { s = this; }

		s.pause();

		if (!s.matchEnded) {
			s._matchEnd(en.PlayerSide.noSide, true);
		}

		s.spectatorsMap.forEach((client) => {
			clientTerminate(client);
		});
		s.playersMap.forEach((client) => {
			clientTerminate(client);
		});
	}
	instantInputDebug(client: ClientPlayer) {
		this._handleInput(c.fixedDeltaTime, client);
	}
	private _handleInput(delta: number, client: ClientPlayer) {
		// if (client.inputBuffer === null) {return;}
		const gc = this.components;
		const input = client.inputBuffer.input;

		if (input === en.InputEnum.up) {
			client.racket.dir.y = -1;
		}
		else if (input === en.InputEnum.down) {
			client.racket.dir.y = 1;
		}

		if (input !== en.InputEnum.noInput) {
			client.racket.moveAndCollide(delta, [gc.wallTop, gc.wallBottom]);
		}

		client.lastInputId = client.inputBuffer.id;
		// client.inputBuffer = null;
	}
	private _gameLoop(s: GameSession) {
		/* s.last_time = s.actual_time;
		s.actual_time = Date.now();
		s.delta_time = (s.actual_time - s.last_time) / 1000; */
		s.delta_time = c.fixedDeltaTime;

		// WIP, replaced by instantInputDebug() to prevent desynchro
		/* s.playersMap.forEach( (client) => {
			s._handleInput(s.delta_time, client);
		}); */

		const gc = s.components;
		gc.ballsArr.forEach((ball) => {
			s._ballMovement(s.delta_time, ball);
		});

		if (s.matchOptions & en.MatchOptions.movingWalls) {
			wallsMovements(s.delta_time, gc);
		}
	}
	private _ballMovement(delta: number, ball: Ball) {
		const gc = this.components;
		if (ball.ballInPlay)
		{
			ball.moveAndBounce(delta, [gc.wallTop, gc.wallBottom, gc.playerLeft, gc.playerRight]);
			if (ball.pos.x > c.w
			||  ball.pos.x < 0 - ball.width)
			{
				ball.ballInPlay = false;
				if (this.matchEnded) {
					return;
				}
				this._scoreUpdate(ball);
				setTimeout(this._newRound, c.newRoundDelay, this, ball);
			}
		}
	}
	private _scoreUpdate(ball: Ball) {
		const gc = this.components;
		if (ball.pos.x > c.w) {
			++gc.scoreLeft;
		}
		else if (ball.pos.x < 0 - ball.width) {
			++gc.scoreRight;
		}
		const scoreUpdate = new ev.EventScoreUpdate(gc.scoreLeft, gc.scoreRight);
		this.playersMap.forEach( (client) => {
			client.socket.send(JSON.stringify(scoreUpdate));
		});
		this.spectatorsMap.forEach( (client) => {
			client.socket.send(JSON.stringify(scoreUpdate));
		});
	}
	private _playersUpdate(s: GameSession) {
		s.lastStateSnapshot = s._gameStateSnapshot();
		s.playersMap.forEach( (client) => {
			s.lastStateSnapshot.lastInputId = client.lastInputId;
			client.socket.send(JSON.stringify(s.lastStateSnapshot));
		});
		s.lastStateSnapshot.lastInputId = 0;
	}
	private _spectatorsUpdate(s: GameSession) {
		s.spectatorsMap.forEach( (client) => {
			client.socket.send(JSON.stringify(s.lastStateSnapshot));
		});
	}
	private _gameStateSnapshot() : ev.EventGameUpdate {
		const gc = this.components;
		const snapshot = new ev.EventGameUpdate();
		snapshot.playerLeft.y = gc.playerLeft.pos.y;
		snapshot.playerRight.y = gc.playerRight.pos.y;
		gc.ballsArr.forEach((ball) => {
			snapshot.ballsArr.push({
				x: ball.pos.x,
				y: ball.pos.y,
				dirX: ball.dir.x,
				dirY: ball.dir.y,
				speed: ball.speed
			});
		});
		if (this.matchOptions & en.MatchOptions.movingWalls) {
			snapshot.wallTop.y = gc.wallTop.pos.y;
			snapshot.wallBottom.y = gc.wallBottom.pos.y;
		}
		return (snapshot);
	}
	private _newRound(s: GameSession, ball: Ball) {
		if (s._checkDisconnexions()) {
			return;
		}
		// https://fr.wikipedia.org/wiki/Tennis_de_table#Nombre_de_manches
		const gc = s.components;
		const minScore = 11;// can be changed for testing
		if (gc.scoreLeft >= minScore || gc.scoreRight >= minScore)
		{
			if (Math.abs(gc.scoreLeft - gc.scoreRight) >= 2)
			{
				if (gc.scoreLeft > gc.scoreRight) {
					s._matchEnd(en.PlayerSide.left);
				}
				else {
					s._matchEnd(en.PlayerSide.right);
				}
				return;
			}
		}
		ball.pos.x = c.w_mid;
		ball.pos.y = random(c.h*0.3, c.h*0.7);
		ball.speed = ball.baseSpeed;
		ball.ballInPlay = true;
	}
	private _checkDisconnexions()
	{
		if (this.playersMap.size !== 2)
		{
			if (this.playersMap.size != 0) {
				this._forfeit();
			}
			else {
				this._matchEnd(en.PlayerSide.noSide, true);
			}
			return true;
		}
		return false;
	}
	private _forfeit()
	{
		console.log("Forfeit Ending");
		const gc = this.components;
		const luckyWinner: ClientPlayer = this.playersMap.values().next().value;
		if (luckyWinner.racket === gc.playerLeft) {
			this._matchEnd(en.PlayerSide.left, true);
		}
		else {
			this._matchEnd(en.PlayerSide.right, true);
		}
	}

	private async _matchEnd(winner: en.PlayerSide, forfeitFlag: boolean = false)
	{
		this.matchEnded = true;
		const eventEnd = new ev.EventMatchEnd(winner, forfeitFlag);
		this.playersMap.forEach( (client) => {
			client.socket.send(JSON.stringify(eventEnd));
		});
		this.spectatorsMap.forEach( (client) => {
			client.socket.send(JSON.stringify(eventEnd));
		});

		const gc = this.components;
		console.log("================================= MATCH ENDED");
		if (forfeitFlag) {
			if (winner === en.PlayerSide.left)
			{
				gc.scoreLeft = 3;
				gc.scoreRight = 0;
			}
			else if (winner === en.PlayerSide.right)
			{
				gc.scoreLeft = 0;
				gc.scoreRight = 3;
			}
			else
			{
				gc.scoreLeft = 0;
				gc.scoreRight = 0;
			}
		}

		fetch(`${c.addressBackEnd}/game/gameserver/updategame`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				gameServerIdOfTheMatch: this.id,
				playerOneUsernameResult: gc.scoreLeft,
				playerTwoUsernameResult: gc.scoreRight,
			})
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
		})
		.catch((error) => {
			console.log("catch /game/gameserver/updategame: ", error);
		});

		setTimeout(this.destroy, 15000, this);

		// logs
		if (winner === en.PlayerSide.left) {
			console.log("Player Left WIN");
		}
		else if (winner === en.PlayerSide.right) {
			console.log("Player Right WIN");
		}
		else {
			console.log("Match end Draw");
		}
	}
}
