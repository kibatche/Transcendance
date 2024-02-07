
import { match } from "assert";
import { MatchHistory } from "../entities/matchHistory.entity";

export class SendableMatchHistory {
  id: number;
  date: Date;
  playerOneUsername: string;
  playerTwoUsername: string;
  playerTwoResult : number;
  playerOneResult : number;

  constructor(matchHistory: MatchHistory) {
		this.id = matchHistory.id;
		this.date = matchHistory.date
		this.playerOneUsername = matchHistory.playerOne.username;
		this.playerTwoUsername = matchHistory.playerTwoUsername;
		this.playerOneResult = matchHistory.playerOneResult;
		this.playerTwoResult = matchHistory.playerTwoResult;
	};
}
