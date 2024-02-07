import { IsNotEmpty, IsString, IsDate, IsOptional } from "class-validator";

export class muteDto
{
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsDate()
	@IsOptional()
	date?: Date;
}


