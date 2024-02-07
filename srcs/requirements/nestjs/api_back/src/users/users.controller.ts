import {
	Body, Controller, Delete, Get, NotFoundException,HttpStatus, Next, Patch, Post, Query, Redirect, Req, Res, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthenticateGuard, TwoFactorGuard } from 'src/auth/42/guards/42guards';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ValidationPipe } from 'src/common/validation/validation.pipe';
import { UpdateUsersDto } from './dto/update-users.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { of } from 'rxjs';
import { storageForAvatar } from 'src/common/constants/constants';
import { use } from 'passport';


@Controller('user')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}
	// par exemple dans postamn ou insomnia http://localhost:3000/users?limit=10&offset=20

	// GET http://transcendance:8080/user/all
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('all')
	findAll(@Req() req) {
		const user : User = req.user;
		return this.usersService.findAll(user);
	}

	////////////////////////////////////////////////////////
	///////////////////////// RUD //////////////////////////
	////////////////////////////////////////////////////////

	/**
	 * On ne fait de création via une route
	 * car un utilisateur est crée à la première connexion  avec l'Oauth de 42.
	 */

	// GET http://transcendance:8080/user?username=NomDuUser
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get()
	findOne(@Query('username') usernameToFind: string, @Req() req) {
		console.log('users service findOne usernameToFind:')
		console.log(usernameToFind)
		console.log('users service findOne my Username:')
		console.log(req.user.username)
		if (usernameToFind === undefined)
			return this.usersService.findOne(req.user.username);
		else
			return this.usersService.findOne(usernameToFind);
	}

	// PATCH http://transcendance:8080/user
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Patch()
	async update(@Req() req, @Body(new ValidationPipe()) usersUpdateDto: UpdateUsersDto, @Res() response : Response) {
		console.log('user.controller updating user info')
		const user = await this.usersService.update(req.user.id, usersUpdateDto, req.user.username);
		if (user.isEnabledTwoFactorAuth === false && user.isTwoFactorAuthenticated === true)
			this.usersService.setIsTwoFactorAuthenticatedWhenLogout(user.id);
		if (user.isEnabledTwoFactorAuth === true && user.isTwoFactorAuthenticated === false)
		{
			return response.status(201).send('2FA redirect')
		}
		console.log("ON RETOURNE 200\n")
		return response.status(200).send("OK")
	}

	// DELETE http://transcendance:8080/user
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Delete()
	remove(@Req() req, @Res() response, @Next() next) {
		this.usersService.remove(req.user.id);
		req.logout(function(err) {
			if (err) { return next(err); }
			response.redirect('/');
		  });
		req.session.cookie.maxAge = 0;
		return {msg : 'Your account has been deleted'};
	}


	// POST http://transcendance:8080/user/avatar
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('avatar')
	@UseInterceptors(FileInterceptor('file', storageForAvatar))
	uploadAvatar(@UploadedFile() file, @Req() request, @Res() res){
		const user : User = request.user;
		if (file)
		{
			this.usersService.updateAvatar(user.id, file.filename);
			return res.status(HttpStatus.OK).json({message : "Avatar updated"});
		}
		return res.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).json({message : "Unsupported media type. Please use a valid image file."});
	}

	// don't pass your own username
	// GET http://transcendance:8080/user/avatar?username=username
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('avatar')
	async getAvatar(@Query('username') username: string, @Req() request, @Res() response) {
		let usernameToFind;
		if (username !== undefined) {
			usernameToFind = username;
		} else {
			usernameToFind = request.user.username;
		}
		const promise = this.usersService.getAvatarUrl(usernameToFind).then((url) =>
		{
			if (url) {
				console.log('what is the URL: ' + url)
				return of(response.sendFile(process.cwd() + '/uploads/avatars/' + url));
			}
			else
				throw new NotFoundException('Avatar not found');
		});
		return promise;
	}

}
