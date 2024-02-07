import { HttpException, HttpStatus, Injectable, Res, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Friendship, FriendshipStatus } from 'src/friendship/entities/friendship.entity';
import { Chatroom } from './entities/chatroom.entity';
import { UsersService } from 'src/users/users.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { SendableFriendship } from 'src/friendship/sendableFriendship';
import { Repository, Brackets } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { roomDto } from './dto/room.dto';
import { messagesDto } from './dto/messages.dto';
import { socketDto } from './dto/socket.dto';
import { muteDto } from './dto/mute.dto';
import * as bcrypt from 'bcrypt';
import { printCaller, printCallerError, sockets, socket_server } from './dev/dev_utils';


@Injectable()
export class ChatService {

	constructor(
		@Inject(forwardRef(() => UsersService))
		private usersService: UsersService,
		private friendshipService: FriendshipService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Chatroom)
		private readonly chatroomRepository: Repository<Chatroom>,
		@InjectRepository(Friendship)
		private readonly friendshipRepository: Repository<Friendship>,
	) {}


	addSocket(key: string, socket: socketDto)
	{
		printCaller(`-- in (key: [${key}]) `);
		if (key)
			sockets.set(key, socket);
	}
	getSocket(key: string)
	{
		printCaller(`-- in (key: [${key}]) `);
		let socket = sockets.get(key);
		return socket;
	}
	removeSocket(key: string)
	{
		printCaller(`-- in (key: [${key}]) `);
		sockets.delete(key);
	}

	// temp for test
//	sleep(ms) {
//		return new Promise(resolve => setTimeout(resolve, ms));
//	}


	/* GETTERS ************************************************
	*/

	async getMyRooms(username: string, fieldsToReturn: string[] = null): Promise<Chatroom[]>
	{
		printCaller("-- in ");
		
		//await this.sleep(1000);
		let rooms: Chatroom[];

		const queryBuilder = this.chatroomRepository
			.createQueryBuilder('chatroom')
			.where('chatroom.users LIKE :user_name', { user_name: `%${username}%` });

		if (fieldsToReturn)
		{
			let fields = fieldsToReturn.map(field => `chatroom.${field}`);
			queryBuilder.select(fields);
		}

		rooms = await queryBuilder.getMany();

		printCaller("-- out ");
		if (rooms)
			return rooms;
		else
		{
			printCallerError(`ERROR in chat: rooms not found for ${username}`);
			return [];
		}
	}

	async getMyDirects(username: string): Promise<Chatroom[]>
	{
		printCaller("-- in ");

		let directs: Chatroom[];

		const my_rooms = await this.getMyRooms(username);
		if (my_rooms)
			directs = my_rooms.filter(room => room.type === 'direct');

		printCaller("-- out ");
		if (directs)
			return directs;
		else
		{
			printCallerError(`ERROR in chat: directs not found for ${username}`);
			return [];
		}
	}

	async getAllRooms(): Promise<Chatroom[]>
	{
		printCaller("-- in ");

		let rooms: Chatroom[] = await this.chatroomRepository
			.createQueryBuilder('chatroom')
			.getMany();

		printCaller("-- out ");
		if (rooms)
			return rooms;
		else
		{
			printCallerError(`ERROR in chat: all rooms not found`);
			return [];
		}
	}

	async getAllNotMyRooms(username: string): Promise<Chatroom[]>
	{
		printCaller("-- in ");

		let rooms: Chatroom[];
		const user_db = await this.getUserByName(username);
		if (user_db)
		{
			rooms = await this.chatroomRepository
				.createQueryBuilder('chatroom')
				.where('chatroom.type NOT IN (:...type)', { type: ['private', 'direct'] })
				.andWhere('chatroom.users NOT LIKE :user_name', { user_name: `%${username}%` })
				.getMany();
		}

		printCaller("-- out ");
		if (rooms)
			return rooms;
		else
		{
			printCallerError(`ERROR in chat: rooms not found for ${username}`);
			return [];
		}
	}

	async getAllOtherRoomsAndUsers(username: string): Promise<roomDto[]>
	{
		printCaller("-- in ");

		const all_rooms = await this.getAllNotMyRooms(username);
		const all_users = await this.getAllUsersNotMyRooms(username);
		if (!all_rooms || !all_users)
		{
			printCallerError(`ERROR in chat: rooms or users not found for ${username}`);
			return [];
		}

		let row_rooms = all_rooms.map(room => {
			return {
				name: room.name,
				type: room.type,
				protection: room.protection,
			};
		});
		let users = all_users.map(user => {
			return {
				name: user.username,
				type: "user",
				protection: false,
			};
		});
		let rooms: roomDto[] = row_rooms.concat(users);

		printCaller("-- out ");
		if (rooms)
			return rooms;
		else
		{
			printCallerError(`ERROR in chat: rooms not found for ${username}`);
			return [];
		}
	}

	async getMessagesFromCurrentRoom(username: string): Promise<messagesDto[]>
	{
		printCaller("-- in ");

		const user_db = await this.getUserByName(username);
		if (!user_db)
		{
			printCallerError(`ERROR in chat: user not found for ${username}`);
			return [];
		}
		const currentRoom = await this.getRoomByName(user_db.currentRoom);
		if (!currentRoom)
		{
			printCallerError(`ERROR in chat: current room not found for ${username}`);
			return [];
		}
		let messages = null;
		if (currentRoom)
			messages = currentRoom.messages;

		printCaller("-- out ");
		if (messages)
			return messages;
		else
		{
			printCallerError(`ERROR in chat: messages not found for ${username}`);
			return [];
		}
	}

	async getCurrentRoomName(username: string): Promise<string>
	{
		printCaller("-- in ");

		const user_db = await this.getUserByName(username);
		if (!user_db)
		{
			printCallerError(`ERROR in chat: 'the user ${username} was not found'`);
			return;
		}

		printCaller("-- out ");
		if (user_db)
			return user_db.currentRoom;
	}

	async getRoomByName(room_name: string, fieldsToReturn: string[] = null): Promise<Chatroom>
	{
		printCaller("-- in ");

		const queryBuilder = this.chatroomRepository
			.createQueryBuilder('chatroom')
			.where('chatroom.name = :name', { name: room_name });

		if (fieldsToReturn)
		{
			let fields = fieldsToReturn.map(field => `chatroom.${field}`);
			queryBuilder.select(fields);
		}

		const room = await queryBuilder.getOne();

		printCaller("-- out ");
		if (room)
			return room;
		else
		{
			printCallerError(`ERROR in chat: room ${room_name} not found`);
			return null;
		}
	}

	async getRoomById(id: number): Promise<Chatroom>
	{
		printCaller("-- in ");

		const room = await this.chatroomRepository
			.createQueryBuilder('chatroom')
			.where('chatroom.id = :id', { id: id })
			.getOne();

		printCaller("-- out ");
		if (room)
			return room;
		else
		{
			printCallerError(`ERROR in chat: room not found ${id}`);
			return null;
		}
	}

	async getUserMute(current_username: string, username: string, ): Promise<muteDto>
	{
		printCaller("- in ");

		const room_name = await this.getCurrentRoomName(current_username);
		const current_room = await this.getRoomByName(room_name);
		let mute = current_room.mutes.find(mute => mute.name === username);

		printCaller("- out ");
		return mute;
	}


	/* SETTERS ************************************************
	*/

	async setCurrentRoom(username: string, room_name: string): Promise<string>
	{
		printCaller("-- in ");

		const user_db = await this.getUserByName(username);
		if (!user_db)
		{
			printCallerError(`ERROR in chat: user ${user_db} not found`);
			return "";
		}
		user_db.currentRoom = room_name;
		await this.userRepository.save(user_db);

		printCaller("-- out ");
		return `room "${room_name}" is now current room`;
	}

	async setPasswordValidation(username: string, room: roomDto): Promise<void>
	{
		printCaller("-- in ");

		const room_db = await this.getRoomByName(room.name);
		if (!room_db)
		{
			printCallerError(`ERROR in chat: room ${room_db} not found`);
			return;
		}
		const is_match = await bcrypt.compare(room.password, room_db.hash);
		if (!is_match)
		{
			printCaller(`throw error: error: true, code: 'BAD_PASSWORD', message: 'bad password'`);
			throw new HttpException({ error: true, code: 'BAD_PASSWORD', message: `bad password` }, HttpStatus.BAD_REQUEST);
		}

		room_db.allowed_users.push(username);
		await this.chatroomRepository.save(room_db);

		printCaller("-- out ");
	}

	async removePassword(username: string, message: string, room: roomDto): Promise<void>
	{
		printCaller("-- in ");

		const room_db = await this.getRoomByName(room.name);
		if (!room_db)
		{
			printCallerError(`ERROR in chat: room not found for ${username}`);
			return;
		}

		if (!room_db.admins.includes(username))
		{
			console.error("throw error: error: true, code: 'NO_ADMIN', message: 'only admins are allowed to remove password'");
			throw new HttpException({ error: true, code: 'NO_ADMIN', message: `only admins are allowed to remove password` }, HttpStatus.FORBIDDEN);
		}
		if (!room.password)
		{
			console.error("throw error: error: true, code: 'NO_PASSWORD', message: 'you must provide a password'");
			throw new HttpException({ error: true, code: 'NO_PASSWORD', message: `you must provide a password` }, HttpStatus.FORBIDDEN);
		}
		const is_match = await bcrypt.compare(room.password, room_db.hash);
		if (!is_match)
		{
			printCaller(`throw error: error: true, code: 'BAD_PASSWORD', message: 'you provided a bad password'`);
			throw new HttpException({ error: true, code: 'BAD_PASSWORD', message: `you provided a bad password` }, HttpStatus.FORBIDDEN);
		}

		// add password to chatroom
		room_db.allowed_users = room.allowed_users;
		room_db.protection = false;
		room_db.hash = "";
		room_db.messages.push({ name: "SERVER", message: message });
		await this.chatroomRepository.save(room_db);

		printCaller("-- out ");
	}

	async setPassword(username: string, message: string, room: roomDto, old_password?: string): Promise<void>
	{
		printCaller("-- in ");

		if (room.type === 'direct')
		{
			console.error("throw error: error: true, code: 'DIRECT_PASSWORD_FORBIDDEN', message: 'you cannot set a password in a direct message room'");
			throw new HttpException({ error: true, code: 'DIRECT_PASSWORD_FORBIDDEN', message: `you cannot set a password in a direct message room` }, HttpStatus.FORBIDDEN);
		}

		const room_db = await this.getRoomByName(room.name);
		if (!room_db)
		{
			printCallerError(`ERROR in chat: room not found for ${username}`);
			return;
		}

		if (!room_db.admins.includes(username))
		{
			console.error("throw error: error: true, code: 'NO_ADMIN', message: 'only admins are allowed to set or modify password'");
			throw new HttpException({ error: true, code: 'NO_ADMIN', message: `only admins are allowed to set or modify password` }, HttpStatus.FORBIDDEN);
		}

		if (!room.password)
		{
			console.error("throw error: error: true, code: 'NO_PASSWORD', message: 'this room has no password protection'");
			throw new HttpException({ error: true, code: 'NO_PASSWORD', message: `this room has no password protection` }, HttpStatus.FORBIDDEN);
		}
		if (room_db.protection)
		{
			if (room.protection && !old_password)
			{
				console.error("throw error: error: true, code: 'MISSING_OLD_PASSWORD', message: 'you need to provide the old password to set a new one'");
				throw new HttpException({ error: true, code: 'MISSING_OLD_PASSWORD', message: `you need to provide the old password to set a new one` }, HttpStatus.FORBIDDEN);
			}
			if (old_password)
			{
				const is_old_match = await bcrypt.compare(room.password, room_db.hash);
				if (is_old_match)
				{
					printCaller(`throw error: error: true, code: 'SAME_PASSWORD', message: 'you provided the same password'`);
					throw new HttpException({ error: true, code: 'SAME_PASSWORD', message: `you provided the same password` }, HttpStatus.BAD_REQUEST);
				}
				const is_match = await bcrypt.compare(old_password, room_db.hash);
				if (!is_match)
				{
					printCaller(`throw error: error: true, code: 'BAD_PASSWORD', message: 'you provided a bad password'`);
					throw new HttpException({ error: true, code: 'BAD_PASSWORD', message: `you provided a bad password` }, HttpStatus.BAD_REQUEST);
				}
			}
		}

		const saltOrRounds = 10;
		const password = room.password;
		let hash: string;
		if (room.protection)
			hash = await bcrypt.hash(password, saltOrRounds);

		// add password to chatroom
		room_db.allowed_users = room.allowed_users;
		room_db.protection = room.protection;
		if (room.protection)
			room_db.hash = hash;
		else
			delete room_db.hash;
		room_db.messages.push({ name: "SERVER", message: message });
		await this.chatroomRepository.save(room_db);

		printCaller("-- out ");
	}

	async setAdmin(current_username: string, user_username: string, room_name: string): Promise<void>
	{
		printCaller("-- in ");

		const room_db = await this.getRoomByName(room_name);
		if (!room_db)
		{
			printCaller(`throw error: error: true, code: 'ROOM_NOT_FOUND', message: 'room ${room_name} not found'`);
			throw new HttpException({ error: true, code: 'ROOM_NOT_FOUND', message: `room ${room_name} not found` }, HttpStatus.UNAUTHORIZED);
		}
		if (room_db.type === "direct")
		{
			printCaller(`throw error: error: true, code: 'NO_DIRECT_ADMIN', message: 'there are no admins in direct messages'`);
			throw new HttpException({ error: true, code: 'NO_DIRECT_ADMIN', message: `there are no admins in direct messages` }, HttpStatus.UNAUTHORIZED);
		}
		if (!room_db.admins.includes(current_username))
		{
			printCaller(`throw error: error: true, code: 'NOT_ADMIN', message: 'you cannot set someone else as admin, since you are not admin yourself'`);
			throw new HttpException({ error: true, code: 'NOT_ADMIN', message: `you cannot set someone else as admin, since you are not admin yourself` }, HttpStatus.UNAUTHORIZED);
		}
		if (room_db.admins.includes(user_username))
		{
			printCaller(`throw error: error: true, code: 'ALREADY_ADMIN', message: 'this user is already an admin'`);
			throw new HttpException({ error: true, code: 'ALREADY_ADMIN', message: `this user is already an admin` }, HttpStatus.UNAUTHORIZED);
		}

		room_db.admins.push(user_username);
		await this.chatroomRepository.save(room_db);

		printCaller("-- out ");
	}

	async findOneRelationshipByUsername(friendUsername : string, username : string): Promise<SendableFriendship>
	{
		printCaller("-- in ");

		const friendship = await this.friendshipRepository
		.createQueryBuilder('friendship')
		.leftJoinAndSelect('friendship.sender', 'sender')
		.leftJoinAndSelect('friendship.receiver', 'receiver')
		.where (
			new Brackets((qb) => {
				qb.where (
					new Brackets((subAQb) => {
						subAQb.where('sender.username = :username', {username : username})
						.andWhere('receiver.username = :friendUsername', {friendUsername : friendUsername})
					})
				)
				.orWhere (
					new Brackets((subBQb) => {
						subBQb.where('sender.username = :friendUsername2', {friendUsername2 : friendUsername})
						.andWhere('receiver.username = :username2', {username2 : username})
						.andWhere('friendship.status != :status', {status : FriendshipStatus.BLOCKED})
					})
				)
			}),
		)
		.getOne();

		if (!friendship)
			return null;
		return new SendableFriendship(friendship);

		printCaller("-- out ");
	}

	async addBlockUser(username: string, to_block_username: string): Promise<void>
	{
		printCaller("-- in ");

		let user = await this.getUserByName(username);
		if (!user)
		{
			printCallerError(`ERROR in chat: room not found for ${username}`);
			return;
		}
		let relation = await this.findOneRelationshipByUsername(to_block_username, username);
		if (relation)
		{
			await this.friendshipService.blockFriendship(relation.id, user);
		}
		else
		{
			const newFriendshipDto = {"receiverUsername": to_block_username, "status": FriendshipStatus.BLOCKED};
			if (newFriendshipDto)
				await this.friendshipService.create(newFriendshipDto, user);
			else
			{
				printCaller(`throw error: error: true, code: 'BLOCK_USER_FAILED', message: 'we couldn't block the user because it was not found'`);
				throw new HttpException({ error: true, code: 'BLOCK_USER_FAILED', message: `we couldn't block the user because it was not found` }, HttpStatus.UNAUTHORIZED);
			}
		}

		printCaller("-- out ");
	}

	async removeBlockUser(username: string, to_unblock_username: string): Promise<void>
	{
		printCaller("-- in ");

		let user = await this.getUserByName(username);
		let relation: SendableFriendship;
		if (user)
			relation = await this.findOneRelationshipByUsername(to_unblock_username, username);
		if (relation)
			await this.friendshipService.removeFriendship(relation.id, user);
		else
		{
			printCaller(`throw error: error: true, code: 'REMOVE_USER_FAILED', message: 'we couldn't unblock the user because it was not found'`);
			throw new HttpException({ error: true, code: 'REMOVE_USER_FAILED', message: `we couldn't unblock the user because it was not found` }, HttpStatus.UNAUTHORIZED);
		}

		printCaller("-- out ");
	}

	async getListBlockUser(username: string): Promise<string[]>
	{
		printCaller("-- in ");

		let users: string[] = [];
		let friends_users: SendableFriendship[];
		let user = await this.getUserByName(username);

		if (user)
			friends_users = await this.friendshipService.findAllBlockedFriends(user.id);
		if (friends_users)
			users = friends_users.map(user => user.receiverUsername);

		printCaller("-- out ");
		return users;
	}


	/* ADDERS *************************************************
	*/

	async addUserToNewRoom(username: string, room: roomDto): Promise<void>
	{
		printCaller("-- in ");

		const find_room = await this.getRoomByName(room.name);
		if (find_room)
		{
			console.error("throw error: error: true, code: 'ROOM_CONFLICT', message: 'This room name already exist'");
			throw new HttpException({ error: true, code: 'ROOM_CONFLICT', message: `This room name already exist` }, HttpStatus.CONFLICT);
		}

		// create chatroom
		let newChatroom = new Chatroom();
		newChatroom.name = room.name;
		newChatroom.type = room.type;
		newChatroom.owner = username;
		newChatroom.admins = [username];
		newChatroom.users = room.users;
		newChatroom.allowed_users = [];
		newChatroom.protection = false;
		newChatroom.messages =
		[
			{ name: "SERVER", message: `creation of room ${room.name}` },
			{ name: "SERVER", message: `${room.users[0]} joined the room` },
		];
		await this.chatroomRepository.save(newChatroom);
		printCaller("-- out ");
	}

	async addUserToRoom(username: string, room_name: string): Promise<roomDto>
	{
		printCaller("-- in ");

		const room: Chatroom = await this.getRoomByName(room_name);
		if(!room)
		{
			printCallerError(`ERROR in chat: room not found for ${username}`);
			return null;
		}

		// update room with new user
		room.users.push(username);
		if (room.owner === "")
		{
			room.owner = username;
			if (!room.admins.includes(username))
				room.admins.push(username);
			if (!room.allowed_users.includes(username))
				room.allowed_users.push(username);
		}
		await this.chatroomRepository.save(room);

		printCaller("-- out ");
		return room;
	}

	async addMessageToRoom(room_name: string, username: string, message: string): Promise<void>
	{
		printCaller("-- in ");

		const my_room = await this.getRoomByName(room_name);
		if(!my_room)
		{
			printCallerError(`ERROR in chat: room not found for ${username}`);
			return;
		}
		let chat_message: messagesDto = {
			name: username,
			message: message,
		};
		my_room.messages.push(chat_message);
		await this.chatroomRepository.save(my_room);

		printCaller("-- out ");
	}

	async addMute(username: string, room_name: string, mute: muteDto): Promise<void>
	{
		printCaller("-- in ");

		const room_db = await this.getRoomByName(room_name);
		if(!room_db)
		{
			console.error("throw error: error: true, code: 'ROOM_NOT_FOUND', message: 'room not found for ${username}'");
			throw new HttpException({ error: true, code: 'ROOM_NOT_FOUND', message: `room not found for ${username}` }, HttpStatus.FORBIDDEN);
		}

		if (!room_db.admins.includes(username))
		{
			console.error("throw error: error: true, code: 'NO_ADMIN', message: 'only admins are allowed to set or modify mute time'");
			throw new HttpException({ error: true, code: 'NO_ADMIN', message: `only admins are allowed to set or modify mute time` }, HttpStatus.FORBIDDEN);
		}

		if (!room_db.mutes)
			room_db.mutes = [mute];
		else
		{
			let already_here = false;
			room_db.mutes.forEach(mute_elem =>
			{
				if (mute_elem.name === mute.name)
				{
					already_here = true;
					mute_elem.date = mute.date;
				}
			});
			if (!already_here)
				room_db.mutes.push(mute);
			else
			{
				console.error("throw error: error: true, code: 'ALREADY_MUTE', message: 'this user is already mute for this room'");
				throw new HttpException({ error: true, code: 'ALREADY_MUTE', message: `this user is already mute for this room` }, HttpStatus.FORBIDDEN);
			}
		}
		await this.chatroomRepository.save(room_db);

		printCaller("-- out ");
	}


	/* REMOVERS ***********************************************
	*/

	async removeUserFromRoom(username: string, room_name: string): Promise<string[]>
	{
		printCaller("-- in ");

		let messages = [`${username} left the room`];

		const room = await this.getRoomByName(room_name);
		if(!room)
		{
			console.error("throw error: error: true, code: 'ROOM_NOT_FOUND', message: 'room_not_found'");
			throw new HttpException({ error: true, code: 'ROOM_NOT_FOUND', message: `room_not_found` }, HttpStatus.NOT_FOUND);
		}
		if (!room.users.includes(username))
		{
			console.error("throw error: error: true, code: 'USER_NOT_FOUND', message: 'your are not in this room'");
			throw new HttpException({ error: true, code: 'USER_NOT_FOUND', message: `your are not in this room` }, HttpStatus.NOT_FOUND);
		}
		if (room.type === "direct")
		{
			console.error("throw error: error: true, code: 'LEAVE_DIRECT_FORBIDDEN', message: 'you cannot leave a direct messages conversation'");
			throw new HttpException({ error: true, code: 'LEAVE_DIRECT_FORBIDDEN', message: `you cannot leave a direct messages conversation` }, HttpStatus.FORBIDDEN);
		}

		// delete user from room
		room.users.push(username);
		room.users = room.users.filter(name => name !== username);
		room.admins = room.admins.filter(name => name !== username);
		if (room.owner === username)
		{
			if (room.admins.length > 0)
			{
				room.owner = room.admins[0];
				messages.push(`${room.owner} is now owner of this room`);
			}
			else if (room.users)
			{
				room.owner = room.users[0];
				room.admins = [room.users[0]];
				messages.push(`${room.owner} is now owner of this room`);
			}
			else
				room.owner = "";
		}
		await this.chatroomRepository.save(room);
		
		printCaller("-- out ");
		return messages;
	}

	async removeMute(username: string, room_name: string): Promise<void>
	{
		printCaller("-- in ");

		const room_db = await this.getRoomByName(room_name);
		if(!room_db)
		{
			printCallerError(`ERROR in chat: room not found for ${username}`);
			return;
		}

		let index = room_db.mutes.findIndex(mute => mute.name === username);
		if (index > -1)
		 room_db.mutes.splice(index, 1);

		await this.chatroomRepository.save(room_db);

		printCaller("-- out ");
	}


	/* SEARCH IN USER *****************************************
	*/

	async getUserByName(username: string): Promise<User>
	{
		printCaller("-- in ");

		const user = await this.userRepository
			.createQueryBuilder('user')
			.where('user.username = :name', { name: username })
			.getOne();

		printCaller("-- out ");
		if (user)
			return user;
		else
		{
			printCallerError(`ERROR in chat: user not found for ${username}`, user);
			return null;
		}
	}

	async getAllUsersNotMyRooms(username: string): Promise<User[]>
	{
		printCaller("-- in ");

		const directs = await this.getMyDirects(username);
		if(!directs)
		{
			printCallerError(`ERROR in chat: direct room not found for ${username}`);
			return null;
		}

		// get all users from directs
		let usernames = directs.map(room => {
			let user = room.users[0];
			if (user === username)
				user = room.users[1];
			return user;
		});
		usernames.push(username);

		const users = await this.userRepository
			.createQueryBuilder('user')
			.where('user.username NOT IN (:...usernames)', { usernames: usernames })
			.getMany();

		printCaller("-- out ");
		if (users)
			return users;
		else
		{
			printCallerError(`ERROR in chat: users not found for ${username}`);
			return [];
		}
	}

	async getAllUsersNotInRoom(current_room_name: string): Promise<User[]>
	{
		printCaller("-- in ");

		// get all users in current room
		const current_room = await this.getRoomByName(current_room_name);
		const usernames = current_room.users;

		const users = await this.userRepository
			.createQueryBuilder('user')
			.where('user.username NOT IN (:...usernames)', { usernames: usernames })
			.getMany();

		printCaller("-- out ");
		if (users)
			return users;
		else
		{
			printCallerError(`ERROR in chat: users not found for ${current_room_name}`);
			return [];
		}
	}


	/* GATEWAY EVENTS *****************************************
	*/

	async socketIncommingMessage(socket: socketDto, message: string): Promise<void>
	{
		printCaller("-- in ");

		let room_name = await this.getCurrentRoomName(socket.username);
		if (!room_name)
		{
			printCallerError(`ERROR in chat: couldn't find room by username: ${socket.username}`);
			return;
		}
		const current_room = await this.getRoomByName(room_name);

		if (current_room.protection)
		{
			if (!current_room.allowed_users.includes(socket.username))
			{
				socket.emit('message', "SERVER", "your message was not sent because you need to validate the password");
				return;
			}
		}
		if (current_room.mutes)
		{
			let current_mute = current_room.mutes.find(mute => mute.name === socket.username);
			if (current_mute)
			{
				let date_diff = 1;
				if (current_mute.date)
				{
					const date_now = new Date();
					const date_mute = new Date(current_mute.date);
					date_diff = date_mute.getTime() - date_now.getTime();
				}
				if (date_diff > 0)
				{
					socket.emit('message', "SERVER", "your message was not sent because you are muted");
					return;
				}
				else
					await this.removeMute(current_mute.name, room_name);
			}
		}

		let socket_name = `${socket.username}_not_emit`;
		await this.addMessageToRoom(room_name, socket.username, message);
		await socket.to(room_name).except(socket_name).emit('message', socket.username, message);

		printCaller("-- out ");
	}

	async socketChangeRoom(socket: socketDto, room_name: string): Promise<void>
	{
		printCaller("-- in ");

		if (socket)
		{
			socket.leave(socket.room);
			socket.join(room_name);
			socket.room = room_name;
		}
		else
		{
			printCaller(`throw error: error: true, code: 'SOCKET_UNDEFINED', message: 'socket_undefined'`);
			throw new HttpException({ error: true, code: 'SOCKET_UNDEFINED', message: `socket_undefined` }, HttpStatus.BAD_REQUEST);
		}

		printCaller("-- out ");
	}

	async socketJoinRoom(socket: socketDto, room_name: string): Promise<void>
	{
		printCaller("-- in ");

		socket.leave(socket.room);
		socket.join(room_name);
		socket.room = room_name;
		let message = `${socket.username} joined the room`;
		await socket.to(socket.room).emit('message', "SERVER", message);
		await this.addMessageToRoom(room_name, "SERVER", message);

		printCaller("-- out ");
	}



	/* LAST MINUTE BAD SOLUTION *******************************
	*/

	async changeAllUsernames(old_name: string, new_name: string): Promise<void>
	{
		printCaller("-- in ");

		let rooms: Chatroom[] = await this.getAllRooms();
		if(!rooms)
		{
			printCallerError(`ERROR in chat: all rooms not found`);
			return null;
		}
		let message = `${old_name} changes it's name for ${new_name}`;
		await rooms.forEach((room) =>
		{
			let room_has_change: boolean = false;

			// users: string[]
			room.users = room.users.map(item =>
			{
				if (item === old_name)
				{
					room_has_change = true;
					return new_name
				}
				return item;
			});

			// admins: string[]
			room.admins = room.admins.map(item =>
			{
				if (item === old_name)
				{
					room_has_change = true;
					return new_name
				}
				return item;
			});

			// users: string[]
			room.allowed_users = room.allowed_users.map(item =>
			{
				if (item === old_name)
				{
					room_has_change = true;
					return new_name
				}
				return item;
			});

			// owner: string
			if(room.owner === old_name)
				room.owner = new_name;

			if (room_has_change)
				this.chatroomRepository.save(room);

			this.addMessageToRoom(room.name, "SERVER", `${old_name} changes it's name for ${new_name}`);
		});

		let socket = this.getSocket(old_name);
		if (socket)
		{
			this.removeSocket(old_name);
			socket.username = new_name;
			this.addSocket(new_name, socket);
			socket_server.server.in(socket.room).emit('message', "SERVER", message);
		}

		printCaller("-- out ");
	}

}

