import { IsBoolean, IsEmpty, IsInt, IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";
import { Socket } from 'socket.io';

export class socketDto extends Socket
{
	@IsString()
	username: string;

	@IsString()
	room: string;

	@IsBoolean()
	@IsOptional()
	new_password?: boolean;
}


