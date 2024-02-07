import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, Brackets } from 'typeorm';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { Friendship, FriendshipStatus } from './entities/friendship.entity';
import { SendableFriendship } from './sendableFriendship';

@Injectable()
export class FriendshipService {

	constructor(
		@InjectRepository(Friendship)
		private readonly friendshipRepository: Repository<Friendship>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) { }

	async findOneRelationshipById(friendId : number, userId : number) {
		const friendship = await this.friendshipRepository
		.createQueryBuilder('friendship')
		.leftJoinAndSelect('friendship.sender', 'sender')
		.leftJoinAndSelect('friendship.receiver', 'receiver')
		.where(
			new Brackets((qb) => {
				qb.where(
					new Brackets((subAQb) => {
						subAQb.where('sender.id = :userId', { userId : userId})
						.andWhere('receiver.id = :friendId', {friendId : friendId})
					})
				)
				.orWhere(
					new Brackets((subBQb) => {
						subBQb.where('sender.id = :friendId2', {friendId2 : friendId})
						.andWhere('receiver.id = :userId2', {userId2 : userId})
						.andWhere('friendship.status != :status', {status : FriendshipStatus.BLOCKED})
					})
				)
			}),
		)
		.getOne()

		if (!friendship) {
			throw new HttpException(`There is no such friendship`, HttpStatus.NOT_FOUND);
		}
		return new SendableFriendship(friendship);
	}

	async findOneRelationshipByUsername(friendUsername : string, username : string) {
		const friendship = await this.friendshipRepository
		.createQueryBuilder('friendship')
		.leftJoinAndSelect('friendship.sender', 'sender')
		.leftJoinAndSelect('friendship.receiver', 'receiver')
		.where(
			new Brackets((qb) => {
				qb.where(
					new Brackets((subAQb) => {
						subAQb.where('sender.username = :username', {username : username})
						.andWhere('receiver.username = :friendUsername', {friendUsername : friendUsername})
					})
				)
				.orWhere(
					new Brackets((subBQb) => {
						subBQb.where('sender.username = :friendUsername2', {friendUsername2 : friendUsername})
						.andWhere('receiver.username = :username2', {username2 : username})
						.andWhere('friendship.status != :status', {status : FriendshipStatus.BLOCKED})
					})
				)
			}),
		)
		.getOne()

		if (!friendship) {
			throw new HttpException(`There is no such friendship`, HttpStatus.NOT_FOUND);
		}
		return new SendableFriendship(friendship);
	}

	async findAllFriendships(userId: number) {
		const friendships = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('friendship.status = :status', { status: FriendshipStatus.ACCEPTED })
			.andWhere('receiver.id = :addressee', { addressee: userId })
			.orWhere('sender.id = :requester', { requester: userId })
			.andWhere('friendship.status = :status', { status: FriendshipStatus.ACCEPTED })
			.getMany();

		let sendFrienships: SendableFriendship[] = [];
		for (const friendship of friendships) {
			sendFrienships.push(new SendableFriendship(friendship));
		}
		return sendFrienships;
	}

	async findOneBlocked(friendshipId: number, userId: number) {
		const friendship = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('friendship.id = :id', { id: friendshipId })
			.andWhere('sender.id = :requester', { requester: userId })
			.andWhere('friendship.status = :status', { status: FriendshipStatus.BLOCKED })
			.getOne();
		if (!friendship)
			throw new HttpException(`The requested blocked not found.`, HttpStatus.NOT_FOUND);
		return new SendableFriendship(friendship);
	}

	async findOneBlockedByUsername(blockedUsername : string, userId : number) {
		const friendship = await this.friendshipRepository
		.createQueryBuilder('friendship')
		.leftJoinAndSelect('friendship.sender', 'sender')
		.leftJoinAndSelect('friendship.receiver', 'receiver')
		.where('sender.id = :senderId', {senderId : userId})
		.andWhere('receiver.username = :friendUsername', {friendUsername : blockedUsername})
		.andWhere('friendship.status = :status  ', {status : FriendshipStatus.BLOCKED})
		.getOne()
		if (!friendship) {
			throw new HttpException(`The requested blocked not found.`, HttpStatus.NOT_FOUND);
		}
		return new SendableFriendship(friendship);
	}

	async findAllBlockedFriends(userId: number) {
		const friendships : Friendship[] =  await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('sender.id = :requestee', { requestee: userId })
			.andWhere('friendship.status = :status', { status: FriendshipStatus.BLOCKED })
			.getMany();
		let sendFrienships: SendableFriendship[] = []
		for (const friendship of friendships) {
			sendFrienships.push(new SendableFriendship(friendship));
		}
		return sendFrienships;
	}

	async findAllPendantRequestsForFriendship(userId: number) {
		const friendships =  await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('sender.id = :requestee', { requestee: userId })
			.andWhere('friendship.status = :status', { status: FriendshipStatus.REQUESTED })
			.getMany();
		let sendFrienships: SendableFriendship[] = []
		for (const friendship of friendships) {
			sendFrienships.push(new SendableFriendship(friendship));
		}
		return sendFrienships;
	}

	async findAllReceivedRequestsForFriendship(userId: number) {
		const friendships = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('receiver.id = :addressee', { addressee: userId })
			.andWhere('friendship.status = :status', { status: FriendshipStatus.REQUESTED })
			.getMany();
		let sendFrienships: SendableFriendship[] = []
		for (const friendship of friendships) {
			sendFrienships.push(new SendableFriendship(friendship));
		}
		return sendFrienships;
	}

	async create(createFriendshipDto: CreateFriendshipDto, creator : User) {
		const receiver = await this.userRepository.findOneBy({username: createFriendshipDto.receiverUsername});
		if (!receiver)
			throw new HttpException(`The addressee does not exist.`, HttpStatus.NOT_FOUND);
		if (createFriendshipDto.status !== FriendshipStatus.REQUESTED && createFriendshipDto.status !== FriendshipStatus.BLOCKED)
			throw new HttpException(`The status is not valid.`, HttpStatus.NOT_FOUND);

		const friendship = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('sender.id = :senderId', {senderId: creator.id})
			.andWhere('receiver.id = :receiverId', {receiverId: receiver.id})
			.orWhere('sender.id = :senderId2', {senderId2: receiver.id})
			.andWhere('receiver.id = :receiverId2', {receiverId2: creator.id})
			.getOne();

		if (friendship) {
			if (friendship.status && friendship.status === FriendshipStatus.ACCEPTED)
				throw new HttpException(`The friendship request has already been accepted.`, HttpStatus.OK);
			else if (friendship.status && friendship.status === FriendshipStatus.REQUESTED) {
				if (friendship && friendship.sender && friendship.sender.id === creator.id) {
					throw new HttpException(`The friendship request has already been sent the ${friendship.date}.`, HttpStatus.OK);
				} else {
					friendship.status = FriendshipStatus.ACCEPTED;
					const saveAFriendship = await this.friendshipRepository.save(friendship);
					return new SendableFriendship(saveAFriendship);
				}
			} else if (friendship.status && friendship.status === FriendshipStatus.BLOCKED)
				throw new HttpException(`We can't do that`, HttpStatus.OK);
			else if (friendship.status && friendship.status === FriendshipStatus.DECLINED)
				throw new HttpException(`The request has been declined.`, HttpStatus.OK);
		}

		const newFriendship = new Friendship();
		newFriendship.sender = creator;
		newFriendship.receiver = receiver;
		newFriendship.status = createFriendshipDto.status;
		const savedFriendship = await this.friendshipRepository.save(newFriendship);
		return new SendableFriendship(savedFriendship);
	}

	async acceptFriendship(relationshipId: number, user: User) {
		const relation = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('friendship.id = :friendshipId', { friendshipId: relationshipId })
			.getOne();
		if (!relation)
			throw new HttpException(`The requested relationship not found.`, HttpStatus.NOT_FOUND);
		if (relation.sender.id === user.id) {
			throw new HttpException(`You can't accept your own request.`, HttpStatus.NOT_FOUND);
		}
		relation.status = FriendshipStatus.ACCEPTED;
		const savedFriendship = await this.friendshipRepository.save(relation);
		return new SendableFriendship(savedFriendship);
	}

	async declineFriendship(relationshipId: number, user: User) {
		const relation = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('friendship.id = :friendshipId', { friendshipId: relationshipId })
			.getOne();
		if (!relation)
			throw new HttpException(`The requested relationship not found.`, HttpStatus.NOT_FOUND);
		if (relation.sender.id === user.id) {
			throw new HttpException(`You can't decline your own request.`, HttpStatus.NOT_FOUND);
		}
		relation.status = FriendshipStatus.DECLINED;
		const savedFriendship = await this.friendshipRepository.save(relation);
		return new SendableFriendship(savedFriendship);
	}

	// Ok i decided you can't block someone who has already blocked you (cuz then you could unblock them and then they're blocking you would no longer apply, in a way negating their blocking of you.
	async blockFriendship(relationshipId: number, user: User) {
		const relation = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('friendship.id = :friendshipId', { friendshipId: relationshipId })
			.andWhere('friendship.status != :friendshipStatus', { friendshipStatus: FriendshipStatus.BLOCKED })
			.getOne();
		if (!relation)
			throw new HttpException(`The requested relationship not found.`, HttpStatus.NOT_FOUND);

		// in the case where you RECEIVED the friendship but now want to block that person
		if (relation.receiver && relation.receiver.id === user.id) {
			const newFriendshipDto = {"receiverUsername": relation.sender.username, "status": FriendshipStatus.BLOCKED};
			await this.removeFriendship(relationshipId, user);
			return await this.create(newFriendshipDto, user);
		} else {
			relation.status = FriendshipStatus.BLOCKED;
			const savedFriendship = await this.friendshipRepository.save(relation);
			return new SendableFriendship(savedFriendship);
		}
	}

	async removeFriendship(relationshipId: number, user : User) {
		const friendship = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where('friendship.id = :friendshipId', { friendshipId: relationshipId })
			.getOne();
		if (!friendship)
			throw new HttpException(`Your friend could not be deleted.`, HttpStatus.NOT_FOUND);
		if (friendship.sender.id !== user.id && friendship.receiver.id !== user.id) {
				throw new HttpException(`You can't do that.`, HttpStatus.FORBIDDEN);
		}
		return this.friendshipRepository.remove(friendship);
	}

	async findIfUserIsBlockedOrHasBlocked(userConnectedId: number, userToFindId: number) {
		const friendship = await this.friendshipRepository
			.createQueryBuilder('friendship')
			.leftJoinAndSelect('friendship.sender', 'sender')
			.leftJoinAndSelect('friendship.receiver', 'receiver')
			.where(
				new Brackets((qb) => {
					qb.where(
						new Brackets((subAQb) => {
							subAQb.where('sender.id = :senderId', { senderId: userConnectedId})
							.andWhere('receiver.id = :receiverId', { receiverId: userToFindId})
						})
					)
					.orWhere(
						new Brackets((subBQb) => {
							subBQb.where('sender.id = :senderId2', {senderId2 : userToFindId})
							.andWhere('receiver.id = :receiverId2', {receiverId2 : userConnectedId})
						})
					)
				}),
			)
			.andWhere('friendship.status = :status', {status : FriendshipStatus.BLOCKED})
			.getOne()

		if (friendship) {
			console.log('we are blocked in friendship.service')
			return true;
		}
		return false;
	}

}
