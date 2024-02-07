import { HttpException, HttpStatus, Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, Not } from 'typeorm';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { UserStats } from './entities/userStat.entities';
import { FriendshipService } from 'src/friendship/friendship.service';
import { ChatService } from 'src/chat/chat.service';
import { MatchHistory } from './entities/matchHistory.entity';

@Injectable()
export class UsersService {

	constructor(
	@Inject(forwardRef(() => ChatService))
	private chatService: ChatService,
	private readonly friendshipService: FriendshipService,
	@InjectRepository(User)
	private readonly userRepository: Repository<User>,
	) {}

	async findOneByFourtyTwoId(fortytwo_id: string) {
		const user  = await this.userRepository.findOneBy({fortyTwoId: fortytwo_id});
		if (!user)
		{
			return null;
		}
		return user;
	}

	async findOne(username: string) {
		const user = await this.userRepository.createQueryBuilder('user')
		.leftJoinAndSelect('user.stats', 'stats')
		.where('user.username = :username', { username: username })
		.getOne();
		if (!user)
			throw new NotFoundException(`The requested user not found.`);

		const partialUser : Partial<User> = {
			username: user.username,
			image_url: user.image_url,
			isEnabledTwoFactorAuth: user.isEnabledTwoFactorAuth,
			status: user.status,
			stats: user.stats,
		};
		return partialUser;
	}

	async isUsernameExists(usernameToSearch: string): Promise<boolean> {
		const user = await this.userRepository.createQueryBuilder('user')
		.where('LOWER(user.username) = LOWER(:username)', {username : usernameToSearch})
		.getOne()
		if (!user)
			return false;
		return true;
	}

	async findAll(currentUser: User) {
		const otherUsers = await this.userRepository.find({where: {id: Not(+currentUser.id)}, order: {username: "ASC"}});

		let partialUsers : Partial<User>[] = [];

		for (const otherUser of otherUsers) {
			if (await this.friendshipService.findIfUserIsBlockedOrHasBlocked(currentUser.id, otherUser.id) === false) {
				partialUsers.push({username: otherUser.username, image_url: otherUser.image_url, status: otherUser.status, stats: otherUser.stats});
			}
		}
		return partialUsers;
	}

	async create(createUserDto: CreateUsersDto) {
		if (await this.userRepository.findOneBy({fortyTwoId: createUserDto.fortyTwoId}))
			throw new HttpException(`The user already exists.`,HttpStatus.CONFLICT);
		const user = this.userRepository.create(createUserDto);
		if (!user)
			throw new HttpException(`The user could not be created.`,HttpStatus.NOT_FOUND);
		user.stats = new UserStats();
		return this.userRepository.save(user);
	}

	async update(id: number, updateUserDto: UpdateUsersDto, username : string) {
		console.log("Maj user username : " + username + " updateuser dto " + updateUserDto.username  )
		if (await this.isUsernameExists(updateUserDto.username) === true && updateUserDto.username.toLowerCase() !== username.toLowerCase()) {
			throw new HttpException(`The username is already in use.`,HttpStatus.CONFLICT);
		}
		const user = await this.userRepository.preload(
			{id: id,
			...updateUserDto});
		if (!user)
			throw new HttpException(`The user could not be updated.`,HttpStatus.NOT_FOUND);
		this.userRepository.save(user);
		// here goes the horrible bandage from hugo
		this.chatService.changeAllUsernames(username, updateUserDto.username);
		return user;
	}

	async remove(id: number) {
		const user = await this.userRepository.findOneBy({id: id});
		if (!user)
			throw new HttpException(`The user could not be deleted.`,HttpStatus.NOT_FOUND);
		return this.userRepository.remove(user);
	}

	async enableTwoFactorAuth(id: number) {
		return this.userRepository.update(id, {isEnabledTwoFactorAuth: true});
	}

	async authenticateUserWith2FA(id: number) {
		return this.userRepository.update(id, { isTwoFactorAuthenticated: true})
	}

	async setIsTwoFactorAuthenticatedWhenLogout(id: number) {
		return this.userRepository.update(id, {isTwoFactorAuthenticated: false});
	}

	async setAuthenticatorSecret(id: number, secret: string) {
		return this.userRepository.update(id, {secretTwoFactorAuth: secret});
	}

	async updateStatus(id: number, status: string) {
		return this.userRepository.update(id, {status: status});
	}

	async updateAvatar(id: number, avatar: string) {
		return this.userRepository.update(id, {image_url: avatar});
	}

	async getAvatarUrl(username: string) {
		const user = await this.userRepository.findOneBy({username: username});
		if (!user)
			throw new HttpException(`The user could not be found.`,HttpStatus.NOT_FOUND);
		if (!user.image_url)
			throw new HttpException(`The user has no avatar.`,HttpStatus.NOT_FOUND);
		return user.image_url;
	}

	async getStats(id: number) {
		const user = await this.userRepository.createQueryBuilder('user')
		.leftJoinAndSelect('user.stats', 'stats')
		.where('user.id = :id', { id: id })
		.getOne();
		if (!user.stats || !user)
			throw new HttpException(`The user's stats could not be found.`,HttpStatus.NOT_FOUND);
		return user.stats;
	}

	async incrementVictories(id: number) {
		const user = await this.userRepository.createQueryBuilder('user')
		.leftJoinAndSelect('user.stats', 'stats')
		.where('user.id = :id', { id: id })
		.getOne();
		if (!user.stats || !user)
			throw new HttpException(`The user's stats could not be found.`,HttpStatus.NOT_FOUND);
		user.stats.winGame++;
		user.stats.totalGame++;
		this.userRepository.save(user);
	}

	async incrementDefeats(id: number) {
		const user = await this.userRepository.createQueryBuilder('user')
		.leftJoinAndSelect('user.stats', 'stats')
		.where('user.id = :id', { id: id })
		.getOne();
		if (!user.stats || !user)
			throw new HttpException(`The user's stats could not be found.`,HttpStatus.NOT_FOUND);
		user.stats.loseGame++;
		user.stats.totalGame++;
		this.userRepository.save(user);
	}

	async incrementDraws(id: number) {
		const user = await this.userRepository.createQueryBuilder('user')
		.leftJoinAndSelect('user.stats', 'stats')
		.where('user.id = :id', { id: id })
		.getOne();
		if (!user.stats || !user)
			throw new HttpException(`The user's stats could not be found.`,HttpStatus.NOT_FOUND);
		user.stats.drawGame++;
		user.stats.totalGame++;
		this.userRepository.save(user);
	}
}
