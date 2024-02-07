import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { Response } from 'express';
import { GrantTicketDto } from './dto/grantTicket.dto';
import { Game } from './entity/game.entity';
import { ValidateTicketDto } from './dto/validateTicket.dto';
import { TokenGame } from './entity/tokenGame.entity';
import { UsersService } from 'src/users/users.service';
import { CreateGameDto } from './dto/createGame.dto';
import { UpdateGameDto } from './dto/updateGame.dto';
import { FriendshipService } from 'src/friendship/friendship.service';
import { STATUS } from 'src/common/constants/constants';
import { MatchHistory } from 'src/users/entities/matchHistory.entity';
import { SendableMatchHistory } from 'src/users/class/matchHistory.class';

@Injectable()
export class GameService {
	constructor (
		@InjectRepository(Game)
		private readonly gameRepository :  Repository<Game>,
		@InjectRepository(User)
		private readonly userRepository : Repository<User>,
		@InjectRepository(MatchHistory)
		private readonly matchHistory : Repository<MatchHistory>,
		@InjectRepository(TokenGame)
		private readonly tokenGameRepository : Repository<TokenGame>,
		private readonly userService : UsersService,
		private readonly friendShipService : FriendshipService
	) { }

	async getMatchesForSpectator() {
		const games = await this.gameRepository.createQueryBuilder("game")
		.where('game.isMatchIsFinished = :isMatchIsFinished', {isMatchIsFinished : false})
		.getMany();
		const gamesToReturn : Partial<Game>[] = []
		for (const game of games)
		{
			gamesToReturn.push({gameServerIdOfTheMatch : game.gameServerIdOfTheMatch,
				gameOptions : game.gameOptions, playerOneUsername : game.playerOneUsername,
				playerTwoUsername : game.playerTwoUsername})
			console.log("Is match is finished : " + game.isMatchIsFinished)
		}
		return gamesToReturn;
	}

	async getMatchHistory(username : string,  @Res() res : Response)
	{
		const user = await this.userRepository.createQueryBuilder("user")
		.where('user.username = :username', {username: username})
		.getOne();
		if (!user)
			return res.status(HttpStatus.NOT_FOUND).json({message : "History for " + username + " not found"});
		console.log(user.username + 'OK USERNAME')
		const gameHistory = await this.matchHistory.
		createQueryBuilder('history')
		.leftJoinAndSelect('history.playerOne', 'playerOne')
		.where('history.playerOne.id = :userOne', {userOne : user.id})
		.getMany();
		console.log("GAME HISTORY")
		console.log(...gameHistory)
		let sendableHistory : SendableMatchHistory[] = []
		for (const history of gameHistory)
		{
			sendableHistory.push(new SendableMatchHistory(history))
		}
		console.log("sendable history")
		console.log(sendableHistory);
		return res.status(HttpStatus.OK).json(sendableHistory);
	}

	async getRankingForAllUsers(currentUser : User) {
		const users = await this.userRepository.createQueryBuilder("user")
		.leftJoinAndSelect("user.stats", "stats")
		.orderBy('stats.winGame', "DESC")
		.getMany();
		const partialUser : Partial<User>[] = []
		for (const user of users)
		{
			if (await this.friendShipService.findIfUserIsBlockedOrHasBlocked(currentUser.id, user.id) === false)
				partialUser.push({username : user.username, stats : user.stats })
		}
		console.log(...partialUser)
		return partialUser;
	}


	async encryptToken(toEncrypt : string) : Promise<string> {
		const iv = randomBytes(16);
		const password = process.env.TICKET_FOR_PLAYING_GAME_SECRET + new Date();
		const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
		const cipher = createCipheriv('aes-256-ctr', key, iv);
		const encryptedText = Buffer.concat([
			cipher.update(toEncrypt),
			cipher.final(),
		]);
		const encryptedTextToReturn = encryptedText.toString('base64');
		return encryptedTextToReturn
	}

	async deletePublicTokens(user : User){
		const tokenGame  = await this.tokenGameRepository.createQueryBuilder('tokengame')
		.where('tokengame.playerTwoUsername = :playerTwoUsername', {playerTwoUsername : user.username})
		.orWhere('tokengame.playerOneUsername = :playerOneUsername', {playerOneUsername : user.username})
		.where('tokengame.isGameIsWithInvitation = :isGameIsWithInvitation', {isGameIsWithInvitation : false})
		.getMany();
		if (tokenGame)
			return this.tokenGameRepository.remove(tokenGame);
	}

	async generateToken(user : User, grantTicketDto : GrantTicketDto, @Res() res : Response)
	{
		console.log(user.status);
		if (user.status === STATUS.IN_POOL || user.status === STATUS.IN_GAME)
		{
			await this.deletePublicTokens(user);
			if (user.status === STATUS.IN_POOL) {
				user.status = STATUS.CONNECTED;
			}
			this.userRepository.save(user);
		}
		if (grantTicketDto.isGameIsWithInvitation === true)
		{
			if (grantTicketDto.playerTwoUsername === user.username) {
				return res.status(HttpStatus.BAD_REQUEST).json({message : "You cant play against yourself."});
			}
			const secondUser : User = await this.userRepository.createQueryBuilder('user')
			.where("user.username = :username", {username : grantTicketDto.playerTwoUsername})
			.getOne();
			if (!secondUser) {
				return res.status(HttpStatus.NOT_FOUND).json({message : "Invited user not found"});
			}
			const encryptedTextToReturn = await this.encryptToken(user.username + '_' + secondUser.username + '_'
			+ grantTicketDto.gameOptions + '_' + grantTicketDto.isGameIsWithInvitation + '_' + new Date())
			const tok = this.tokenGameRepository.create(grantTicketDto);
			tok.numberOfRegisteredUser = 0;
			tok.token = encryptedTextToReturn;
			this.tokenGameRepository.save(tok);
			this.userService.updateStatus(user.id, STATUS.IN_POOL)
			this.userService.updateStatus(secondUser.id, STATUS.IN_POOL)
			return res.status(HttpStatus.OK).json({ token : encryptedTextToReturn });
		}
		else if (grantTicketDto.isGameIsWithInvitation === false) {
			const encryptedTextToReturn = await this.encryptToken(user.username +  '_'
			+ grantTicketDto.gameOptions + '_' +  grantTicketDto.isGameIsWithInvitation + '_' + new Date())
			const tok = this.tokenGameRepository.create(grantTicketDto);
			tok.numberOfRegisteredUser = 0;
			tok.token = encryptedTextToReturn;
			this.tokenGameRepository.save(tok);
			this.userService.updateStatus(user.id, STATUS.IN_POOL)
			return res.status(HttpStatus.OK).json({ token : encryptedTextToReturn });
		}
		return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message : "Internal Server Error"});
	}

	async validateToken(validateTicketDto : ValidateTicketDto) {
		if (validateTicketDto.isGameIsWithInvitation === true)
		{
			console.log("validateToken() PRIVATE");
			const tokenGame : TokenGame  = await this.tokenGameRepository.createQueryBuilder('tokengame')
			.where('tokengame.playerOneUsername = :playerOneUsername', {playerOneUsername : validateTicketDto.playerOneUsername})
			.andWhere('tokengame.playerTwoUsername = :playerTwoUsername', {playerTwoUsername : validateTicketDto.playerTwoUsername})
			.andWhere('tokengame.gameOptions = :gameOption', {gameOption : validateTicketDto.gameOptions})
			.andWhere('tokengame.isGameIsWithInvitation = :isGameIsWithInvitation', {isGameIsWithInvitation: true})
			.andWhere('tokengame.token = :token', {token : validateTicketDto.token})
			.getOne();
			if (tokenGame)
			{
				console.log("playerOneUsername: " + tokenGame.playerOneUsername + "| playerTwoUsername: " + tokenGame.playerTwoUsername);

				tokenGame.numberOfRegisteredUser++;
				this.tokenGameRepository.save(tokenGame);
				if (tokenGame.numberOfRegisteredUser === 2)
				{
					this.tokenGameRepository.remove(tokenGame)
				}
				return true;
			}
		}
		else if (validateTicketDto.isGameIsWithInvitation === false)
		{
			console.log("validateToken() PUBLIC");
			const tokenGame : TokenGame  = await this.tokenGameRepository.createQueryBuilder('tokengame')
			.where('tokengame.playerOneUsername = :playerOneUsername', {playerOneUsername : validateTicketDto.playerOneUsername})
			.andWhere('tokengame.gameOptions = :gameOption', {gameOption : validateTicketDto.gameOptions})
			.andWhere('tokengame.isGameIsWithInvitation = :isGameIsWithInvitation', {isGameIsWithInvitation: false})
			.andWhere('tokengame.token = :token', {token : validateTicketDto.token})
			.getOne();
			if (tokenGame)
			{
				this.tokenGameRepository.remove(tokenGame)
				console.log("USERNAME : " + tokenGame.playerOneUsername)
				return true;
			}
		}
		return false;
	}

	async findInvitations(user : User, @Res() res : Response) {
		const game  = await this.tokenGameRepository.createQueryBuilder('tokengame')
		.where('tokengame.playerTwoUsername = :playerTwoUsername', {playerTwoUsername : user.username})
		.orWhere('tokengame.playerOneUsername = :playerOneUsername', {playerOneUsername : user.username})
		.andWhere('tokengame.isGameIsWithInvitation = :invit', {invit : true})
		.getMany();
		if (!game)
			return res.status(HttpStatus.NOT_FOUND).send({message : "No invitation found"});
		let partialGame : Partial<TokenGame>[] = [];
		for (const gameToken of game) {
			partialGame.push({
				playerOneUsername : gameToken.playerOneUsername,
				playerTwoUsername : gameToken.playerTwoUsername,
				gameOptions : gameToken.gameOptions,
				token : gameToken.token,
			});
		}
		return res.status(HttpStatus.OK).json(partialGame);
	}

	async declineInvitation(user : User, token : string, @Res() res : Response)
	{
		console.log("On décline l'invitation")
		const tokenGame  = await this.tokenGameRepository.createQueryBuilder('tokengame')
		.where('tokengame.token = :token', {token : token})
		.getOne();
		if (tokenGame)
		{
			this.tokenGameRepository.remove(tokenGame);
			return res.status(HttpStatus.OK).json({message : "Invitation declined."});
		}
		return res.status(HttpStatus.NOT_FOUND).json({message : "No invitation found !"});
	}

	async destroySession(token : string)
	{
		console.log("On détruit le token et la session qui va avec")
		const tokenGame  = await this.tokenGameRepository.createQueryBuilder('tokengame')
		.where('tokengame.token = :token', {token : token})
		.getOne();
		if (tokenGame)
		{
			const playerOne = await this.userRepository.findOneBy({username : tokenGame.playerOneUsername})
			const playerTwo = await this.userRepository.findOneBy({username : tokenGame.playerTwoUsername})
			if (playerOne.status !== STATUS.DISCONNECTED)
				this.userService.updateStatus(playerOne.id, STATUS.CONNECTED)
			if (playerTwo.status !== STATUS.DISCONNECTED)
				this.userService.updateStatus(playerTwo.id, STATUS.CONNECTED)
			return this.tokenGameRepository.remove(tokenGame);
		}
		return new HttpException("Token not found !", HttpStatus.NOT_FOUND)
	}

	async acceptInvitation(user : User, token : string, @Res() res : Response)
	{
		const tokenGame  = await this.tokenGameRepository.createQueryBuilder('tokenGame')
		.where('tokenGame.token = :token', {token : token})
		.getOne();
		if (tokenGame)
		{
			this.tokenGameRepository.save(tokenGame)
			return res.status(HttpStatus.OK).json({message : "Invitation accepted."});
		}
		return res.status(HttpStatus.NOT_FOUND).json({message : "No invitation found !"});
	}

	async createGame(creategameDto : CreateGameDto)
	{
		if (creategameDto.playerOneUsername === "" || creategameDto.playerTwoUsername === ""
			|| creategameDto.playerOneUsername === creategameDto.playerTwoUsername)
			return HttpStatus.INTERNAL_SERVER_ERROR
		const game = this.gameRepository.create(creategameDto)
		game.isMatchIsFinished = false;
		this.gameRepository.save(game);
		if (!game)
			return HttpStatus.INTERNAL_SERVER_ERROR
		const playerOne : User = await this.userRepository.createQueryBuilder('user')
		.where("user.username = :username", {username : creategameDto.playerOneUsername})
		.getOne();
		const playerTwo : User = await this.userRepository.createQueryBuilder('user')
		.where("user.username = :username", {username : creategameDto.playerTwoUsername})
		.getOne();
		this.userService.updateStatus(playerOne.id, STATUS.IN_GAME)
		this.userService.updateStatus(playerTwo.id, STATUS.IN_GAME)
		console.log("200 retourné pour la création de partie")
		return HttpStatus.OK
	}

	async updateGame(updateGameDto : UpdateGameDto) {
		console.log("Updata game" + updateGameDto)
		const game = await this.gameRepository.createQueryBuilder('game')
		.where("game.gameServerIdOfTheMatch = :gameServerIdOfTheMatch", {gameServerIdOfTheMatch : updateGameDto.gameServerIdOfTheMatch})
		.getOne();
		if (!game)
			throw new HttpException(`The game could not be updated.`,HttpStatus.NOT_FOUND);
		game.isMatchIsFinished = true;
		game.playerOneUsernameResult = updateGameDto.playerOneUsernameResult
		game.playerTwoUsernameResult = updateGameDto.playerTwoUsernameResult
		this.gameRepository.save(game);
		console.log("On a sauvegardé la partie. Game :")
		console.log(game)
		const playerOne = await this.userRepository.findOneBy({username : game.playerOneUsername})
		const playerTwo = await this.userRepository.findOneBy({username : game.playerTwoUsername})
		if (!playerOne || !playerTwo)
			return new HttpException("Internal Server Error. Impossible to update the database", HttpStatus.INTERNAL_SERVER_ERROR);
		this.userService.updateStatus(playerOne.id, STATUS.CONNECTED);
		this.userService.updateStatus(playerTwo.id, STATUS.CONNECTED);
		if (game.playerOneUsernameResult === game.playerTwoUsernameResult)
		{
			this.userService.incrementDraws(playerOne.id)
			this.userService.incrementDraws(playerTwo.id)
			console.log("DRAW NEST");
		}
		else if (game.playerOneUsernameResult < game.playerTwoUsernameResult)
		{
			this.userService.incrementDefeats(playerOne.id)
			this.userService.incrementVictories(playerTwo.id)
		}
		else
		{
			this.userService.incrementVictories(playerOne.id)
			this.userService.incrementDefeats(playerTwo.id)
		}
		const matchHistoryPlayerOne = new MatchHistory();
		matchHistoryPlayerOne.playerOne = playerOne;
		matchHistoryPlayerOne.playerTwoUsername = playerTwo.username;
		matchHistoryPlayerOne.playerOneResult = game.playerOneUsernameResult;
		matchHistoryPlayerOne.playerTwoResult = game.playerTwoUsernameResult;
		const savedHistoryPone = await this.matchHistory.save(matchHistoryPlayerOne);

		const matchHistoryPlayerTwo = new MatchHistory();
		matchHistoryPlayerTwo.playerOne = playerTwo;
		matchHistoryPlayerTwo.playerTwoUsername = playerOne.username;
		matchHistoryPlayerTwo.playerOneResult = game.playerTwoUsernameResult;
		matchHistoryPlayerTwo.playerTwoResult = game.playerOneUsernameResult;
		const savedHistoryPTwo = await this.matchHistory.save(matchHistoryPlayerTwo);

		console.log("MATCH HISTORYsssssssssss")
		console.log(savedHistoryPone);
		console.log(savedHistoryPTwo);
		return HttpStatus.OK
	}

	async resetStatus(username : string){
		const user : User = await this.userRepository.findOneBy({username : username})
		if (!user)
			return HttpStatus.NOT_FOUND;
		this.userService.updateStatus(user.id, STATUS.CONNECTED);
	}
}

