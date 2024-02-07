
import * as en from "../enums.js"

/* From Server */
export class ServerEvent {
	type: en.EventTypes;
	constructor(type: en.EventTypes = 0) {
		this.type = type;
	}
}

export class EventAssignId extends ServerEvent {
	id: string;
	constructor(id: string) {
		super(en.EventTypes.assignId);
		this.id = id;
	}
}

export class EventMatchmakingComplete extends ServerEvent {
	side: en.PlayerSide = en.PlayerSide.noSide;
	playerOneUsername: string;
	playerTwoUsername: string;
	constructor(playerOneUsername: string, playerTwoUsername: string) {
		super(en.EventTypes.matchmakingComplete);
		this.playerOneUsername = playerOneUsername;
		this.playerTwoUsername = playerTwoUsername;
	}
}

export class EventGameUpdate extends ServerEvent {
	playerLeft = {
		y: 0
	};
	playerRight = {
		y: 0
	};
	ballsArr: {
		x: number,
		y: number,
		dirX: number,
		dirY: number,
		speed: number
	}[] = [];
	wallTop? = {
		y: 0
	};
	wallBottom? = {
		y: 0
	};
	lastInputId = 0;
	constructor() { // TODO: constructor that take GameComponentsServer maybe ?
		super(en.EventTypes.gameUpdate);
	}
}

export class EventScoreUpdate extends ServerEvent {
	scoreLeft: number;
	scoreRight: number;
	constructor(scoreLeft: number, scoreRight: number) {
		super(en.EventTypes.scoreUpdate);
		this.scoreLeft = scoreLeft;
		this.scoreRight = scoreRight;
	}
}

export class EventMatchEnd extends ServerEvent {
	winner: en.PlayerSide;
	forfeit: boolean;
	constructor(winner: en.PlayerSide, forfeit = false) {
		super(en.EventTypes.matchEnd);
		this.winner = winner;
		this.forfeit = forfeit;
	}
}

export class EventMatchAbort extends ServerEvent {
	constructor() {
		super(en.EventTypes.matchAbort);
	}
}

export class EventError extends ServerEvent {
	message: string;
	constructor(message: string) {
		super(en.EventTypes.error);
		this.message = message;
	}
}


/* From Client */
export class ClientEvent {
	type: en.EventTypes; // readonly ?
	constructor(type: en.EventTypes = 0) {
		this.type = type;
	}
}

export class ClientAnnounce extends ClientEvent {
	role: en.ClientRole;
	constructor(role: en.ClientRole) {
		super(en.EventTypes.clientAnnounce);
		this.role = role;
	}
}

export class ClientAnnouncePlayer extends ClientAnnounce {
	clientId: string; // unused
	matchOptions: en.MatchOptions;
	token: string;
	username: string;
	privateMatch: boolean;
	playerTwoUsername?: string;
	isInvitedPerson? : boolean;
	constructor(matchOptions: en.MatchOptions, token: string, username: string, privateMatch: boolean = false, playerTwoUsername?: string, isInvitedPerson? : boolean) {
		super(en.ClientRole.player);
		this.matchOptions = matchOptions;
		this.token = token;
		this.username = username;
		this.privateMatch = privateMatch;
		if (isInvitedPerson) {
			this.isInvitedPerson = isInvitedPerson;
		}
		if (playerTwoUsername) {
			this.playerTwoUsername = playerTwoUsername;
		}
	}
}

export class ClientAnnounceSpectator extends ClientAnnounce {
	gameSessionId: string;
	constructor(gameSessionId: string) {
		super(en.ClientRole.spectator);
		this.gameSessionId = gameSessionId;
	}
}

export class EventInput extends ClientEvent {
	input: en.InputEnum;
	id: number;
	constructor(input: en.InputEnum = en.InputEnum.noInput, id: number = 0) {
		super(en.EventTypes.clientInput);
		this.input = input;
		this.id = id;
	}
}
