import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticateGuard, TwoFactorGuard } from 'src/auth/42/guards/42guards';
import { User } from 'src/users/entities/user.entity';
import { Response } from 'express';
import { CreateGameDto } from './dto/createGame.dto';
import { GrantTicketDto } from './dto/grantTicket.dto';
import { UpdateGameDto } from './dto/updateGame.dto';
import { ValidateTicketDto } from './dto/validateTicket.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor (private readonly gameService : GameService) { }


	@Get('match/all')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	async getMatchesForSpectator()
	{
		return this.gameService.getMatchesForSpectator();
	}

	@Get('match/history')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	async getMatchHistory(@Req() req, @Query('username') username: string, @Res() res)
	{
		if (!username) {
			username = req.user.username;
		}
		return this.gameService.getMatchHistory(username, res);
	}

	@Get('ranking')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	async getRankingForAllUsers(@Req() req)
	{
		const currentUser : User = req.user
		return this.gameService.getRankingForAllUsers(currentUser);
	}

	@Post('ticket')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	async grantTicket(@Req() req, @Body() grantTicketDto : GrantTicketDto, @Res() res : Response)
	{
		const user : User = req.user
		if (grantTicketDto.playerOneUsername != user.username)
			return res.status(HttpStatus.BAD_REQUEST).json({message : 'You can\'t grant a ticket to another user'});
		return this.gameService.generateToken(user, grantTicketDto, res);
	}

	@Post('decline')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	async declineInvitation(@Body('token') token, @Req() req, @Res() res : Response)
	{
		const user : User = req.user;
		return this.gameService.declineInvitation(user, token, res);
	}

	@Post('accept')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	async acceptInvitation(@Body('token') token, @Req() req, @Res() res : Response)
	{
		const user : User = req.user;
		return this.gameService.acceptInvitation(user, token, res);
	}


	@Get('invitations')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	async findInvitations(@Req() request, @Res() res : Response)
	{
		const user : User = request.user;
		return this.gameService.findInvitations(user, res);
	}

	//
	//N'est valable que pour le game-serveur.
	@Post('gameserver/validate')
	async validateTicket(@Body() validateTicketDto : ValidateTicketDto, @Req() request)
	{
		if (await this.gameService.validateToken(validateTicketDto) === false)
			return new HttpException("The token is not valid", HttpStatus.NOT_FOUND);
		console.log("200 retourné côté nest")
		return HttpStatus.OK;
	}

	@Post('gameserver/creategame')
	async createGame(@Body() creategameDto : CreateGameDto)
	{
		console.log("On est dans create game")
		console.log(creategameDto)
		return this.gameService.createGame(creategameDto);
	}

	@Post('gameserver/updategame')
	async updateGame(@Body() updateGameDto : UpdateGameDto)
	{
		console.log("On est dans update game")
		console.log(updateGameDto)
		return this.gameService.updateGame(updateGameDto);
	}

	@Post('gameserver/destroysession')
	async destroySession(@Body('token') token)
	{
		return this.gameService.destroySession(token);
	}

	@Post('gameserver/resetuserstatus')
	async resetUserStatus(@Body('username') username){
		this.gameService.resetStatus(username);
	}
}
