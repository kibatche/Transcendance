
export class InitOptions {
	sound = "off";
	multi_balls = false;
	moving_walls = false;
	isSomeoneIsInvited = false;
	isInvitedPerson = false;
	playerOneUsername = "";
	playerTwoUsername = "";
	reset(playerOneUsername: string) {
		this.sound = "off";
		this.multi_balls = false;
		this.moving_walls = false;
		this.isSomeoneIsInvited = false;
		this.isInvitedPerson = false;
		this.playerOneUsername = playerOneUsername;
		this.playerTwoUsername = "";		
	}
}
