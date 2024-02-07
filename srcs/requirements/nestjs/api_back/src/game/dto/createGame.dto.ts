import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateGameDto {
	@IsString()
	@IsNotEmpty()
	gameServerIdOfTheMatch : string
	@IsNumber()
	@IsNotEmpty()
	gameOptions: number
	@IsString()
	@IsNotEmpty()
	playerOneUsername : string
	@IsString()
	playerTwoUsername : string
	@IsNumber()
	playerTwoUsernameResult : number
	@IsNumber()
	playerOneUsernameResult : number
}
