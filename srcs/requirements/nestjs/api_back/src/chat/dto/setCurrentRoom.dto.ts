import { IsBoolean, IsEmpty, IsInt, IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";

export class setCurrentRoomDto
{
	@IsString()
	@IsNotEmpty()
	name: string;
}

