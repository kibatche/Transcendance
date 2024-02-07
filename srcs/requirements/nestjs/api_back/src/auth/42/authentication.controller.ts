import { Controller, Get, Res, UseGuards, Req, Post, UnauthorizedException, Body, Options, Next } from '@nestjs/common';
import { AuthenticateGuard, FortyTwoAuthGuard, TwoFactorGuard } from './guards/42guards';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import { TwoFaDto } from './dto/2fa.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { STATUS } from 'src/common/constants/constants';

@Controller('auth')
export class AuthenticationController {

	constructor(private authService: AuthenticationService,
				private userService: UsersService,
				) {}

	/**
	 * GET /api/v2/auth
	 * Route pour l'autentification des utilisateurs
	 */
	@Get()
	@UseGuards(FortyTwoAuthGuard)
	login(@Res() response : Response) {
		console.log('ON EST DANS LOGIN AUTH CONTROLLER');
		return ;
	}

	/**
	 * GET /api/v2/auth/redirect
	 * C'est la route que nous devons spécifier à l'Oauth de 42.
	 * L'api de 42 redirige vers cette route après l'autentification.
	 */
	@Get('redirect')
	@UseGuards(FortyTwoAuthGuard)
	async redirect(@Res() response : Response, @Req() request) {
		console.log('ON EST DANS REDIRECT AUTH CONTROLLER');
		console.log('On redirige');
		const user : User = request.user
		if (user.isEnabledTwoFactorAuth === false || user.isTwoFactorAuthenticated === true){
			this.userService.updateStatus(user.id, STATUS.CONNECTED)
			console.log('ON VA VERS PROFILE');
			return response.status(200).redirect('http://' + process.env.WEBSITE_HOST + ':' + process.env.WEBSITE_PORT + '/#/profile');
		}
		console.log('ON VA VERS 2FA')
		return response.status(200).redirect('http://' + process.env.WEBSITE_HOST + ':' + process.env.WEBSITE_PORT + '/#/2fa');
	}

	/**
	 * POST /api/v2/auth/logout
	 * Route pour déconnecter l'utilisateur
	 */
	@Post('logout')
	@UseGuards(AuthenticateGuard)
	logout(@Req() request, @Res() response, @Next() next) {
		this.userService.setIsTwoFactorAuthenticatedWhenLogout(request.user.id);
		this.userService.updateStatus(request.user.id, STATUS.DISCONNECTED);
		request.logout(function(err) {
			if (err) { return next(err); }
			response.redirect('/');
		  });
		request.session.cookie.maxAge = 0;
		return {msg : 'You are now logged out'};
	}

	@Post('2fa/generate')
	@UseGuards(AuthenticateGuard)
	async register(@Req() request, @Res() response){
		const user : User = request.user;
		if (user.isEnabledTwoFactorAuth === true)
		{
			console.log('ON EST DANS REGISTER POUR 2FA AUTH CONTROLLER')
			const { otpauth } = await this.authService.generate2FaSecret(request.user);
			return this.authService.pipeQrCodeStream(response, otpauth);
		}
	}


	@Post('2fa/check')
	@UseGuards(AuthenticateGuard)
	async verify(@Req() request, @Body() {twoFaCode} : TwoFaDto, @Res() response){
		const user : User = request.user;
		console.log('ON EST DANS VERIFY POUR 2FA AUTH CONTROLLER')
		const isCodeIsValid = await this.authService.verify2FaCode(request.user, twoFaCode);
		if (isCodeIsValid === false)
			throw new UnauthorizedException('Wrong Code.');
		await this.userService.authenticateUserWith2FA(request.user.id);
		console.log('ON REDIRIGE');
		this.userService.updateStatus(user.id, STATUS.CONNECTED)
		return response.status(200).redirect('http://' + process.env.WEBSITE_HOST + ':' + process.env.WEBSITE_PORT + '/#/profile');
	}
}
