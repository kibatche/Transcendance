import { IsBoolean, IsEmpty, IsInt, IsIn, IsNotEmpty, IsNumber, IsArray, IsString, IsInstance, ValidateNested, IsObject, IsOptional, IsEnum } from "class-validator";
import { messagesDto } from 'src/chat/dto/messages.dto';

export class roomDto
{
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	@IsIn(["public", "private", "direct", "user"])
	type: string;

	@IsBoolean()
	protection: boolean;

	@IsBoolean()
	@IsOptional()
	allowed?: boolean;

	@IsString()
	@IsOptional()
	password?: string;

	@IsString()
	@IsOptional()
	owner?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	admins?: string[];

	@IsString()
	@IsOptional()
	client_name?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	users?: string[]; // usernames

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	allowed_users?: string[]; // usernames

	@IsArray()
	//@IsInstance(messagesDto, { each: true })
	//@IsObject({ each: true })
	@ValidateNested({ each: true })
	@IsOptional()
	messages?: messagesDto[];
}

