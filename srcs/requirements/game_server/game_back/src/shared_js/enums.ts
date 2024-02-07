
export enum EventTypes {
	// Class Implemented
	gameUpdate = 1,
	scoreUpdate,
	matchEnd,
	assignId,
	matchmakingComplete,
	error,

	// Generic
	matchmakingInProgress,
	matchStart,
	matchAbort,
	matchNewRound, // unused
	matchPause, // unused
	matchResume, // unused

	// Client
	clientAnnounce,
	clientPlayerReady,
	clientSpectatorReady,
	clientInput,

}

export enum InputEnum {
	noInput = 0,
	up = 1,
	down,
}

export enum PlayerSide {
	noSide = 0,
	left = 1,
	right
}

export enum ClientRole {
	player = 1,
	spectator
}

export enum MatchOptions {
	// binary flags, can be mixed
	noOption = 0b0,
	multiBalls = 1 << 0,
	movingWalls = 1 << 1
}
