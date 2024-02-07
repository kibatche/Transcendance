import { IsBoolean, Matches, MaxLength,  IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { isSet } from 'util/types';

export class CreateUsersDto {
	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-zA-Z0-9'-_]+$/)
	@MaxLength(50)
	readonly username: string;
	readonly fortyTwoId: string;
	@IsEmail()
	readonly email: string;
	@IsString()
	readonly image_url: string;
	@IsString()
	readonly status: string;
	@IsBoolean()
	readonly isEnabledTwoFactorAuth: boolean;
}
