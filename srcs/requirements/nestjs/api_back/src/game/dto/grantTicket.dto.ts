import { IsBoolean, IsEmpty, IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsNull } from "typeorm";

export class GrantTicketDto {
	@IsString()
	@IsNotEmpty()
	playerOneUsername : string
	@IsString()
	playerTwoUsername : string
	@IsNumber()
	gameOptions : number
	@IsBoolean()
	isGameIsWithInvitation : boolean
}
