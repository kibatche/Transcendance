import { Injectable } from '@nestjs/common';
import { CreateUsersDto } from 'src/users/dto/create-users.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { toFileStream } from 'qrcode';
import { authenticator } from 'otplib';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
	constructor(
			private readonly userService: UsersService,
		) {}

	async validateUser(createUsersDto :CreateUsersDto){
		console.log("Validate inside authentication.service.ts");
		const user = await this.userService.findOneByFourtyTwoId(createUsersDto.fortyTwoId);
		if (user)
			return user;

		let check_name : boolean = false;
		if (!user)
			check_name = await this.userService.isUsernameExists(createUsersDto.username);
		if (!check_name)
			return await this.userService.create(createUsersDto);
		let createUsersDtoWithUsername : CreateUsersDto = createUsersDto;
		let i = 0;
		while (check_name === true)
		{
			createUsersDtoWithUsername = { ...createUsersDto, username: createUsersDto.username + '_' + i};
			check_name = await this.userService.isUsernameExists(createUsersDtoWithUsername.username);
			i++;
		}
		return this.userService.create(createUsersDtoWithUsername);
	}

	async findUser(fourtytwo_id : string): Promise<User | undefined> {
		return await this.userService.findOneByFourtyTwoId(fourtytwo_id);
	}

	async verify2FaCode(user : User, code : string) {
		console.log("User : " + user.username);
		return authenticator.verify({ token: code, secret: user.secretTwoFactorAuth });
	}

	async generate2FaSecret(user : User) {
		let secret : string;
		secret = user.secretTwoFactorAuth;
		if (!user.secretTwoFactorAuth)
			secret = authenticator.generateSecret();
		const otpauth = authenticator.keyuri(user.email, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);
		await this.userService.setAuthenticatorSecret(user.id, secret);
		return { secret, otpauth };
	}

	async pipeQrCodeStream(stream : Response, otpauthUrl : string) {
		return toFileStream(stream, otpauthUrl);
	}

}


