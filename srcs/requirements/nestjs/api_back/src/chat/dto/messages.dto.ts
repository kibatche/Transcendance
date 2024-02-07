import { IsString, IsOptional } from "class-validator";

export class messagesDto
{
	@IsString()
	@IsOptional()
	name: string;

	@IsString()
	@IsOptional()
	message: string;
}

