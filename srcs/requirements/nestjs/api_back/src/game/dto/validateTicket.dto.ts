import { IsBase64, IsBoolean, IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ValidateTicketDto {
	@IsString()
	@IsNotEmpty()
	playerOneUsername : string
	@IsString()
	playerTwoUsername : string
	@IsNumber()
	gameOptions : number
	@IsBoolean()
	isGameIsWithInvitation : boolean
	@IsBase64()
	@IsNotEmpty()
	token : string
}
