import { Controller, UseGuards, HttpException, HttpStatus, Get, Post, Delete, Body, Req, Res } from '@nestjs/common';
import { AuthenticateGuard, TwoFactorGuard } from 'src/auth/42/guards/42guards';
import { ChatService } from './chat.service';
import { User } from 'src/users/entities/user.entity';
import { ChatGateway } from './chat.gateway';
import { Chatroom } from './entities/chatroom.entity';
import { socketDto } from './dto/socket.dto';
import { roomDto } from './dto/room.dto';
import { setCurrentRoomDto } from './dto/setCurrentRoom.dto';
import { muteDto } from './dto/mute.dto';
import { printCaller, printCallerError } from './dev/dev_utils';

@Controller('chat')
export class ChatController {

	constructor(
		private chatService: ChatService,
		private chatGateway: ChatGateway,
	) {}

	private format_room(room)
	{
		let new_room: roomDto = {
			name: room.name,
			type: room.type,
			protection: room.protection,
		};
		if (room.owner)
			new_room.owner = room.owner;
		if (room.users)
			new_room.users = room.users;
		if (room.allowed)
			new_room.allowed = room.allowed;

		return new_room;
	}

	// don't allow '+' because it's used in direct rooms name
	private allowed_chars = '-#!?_';
	private escape_chars(str)
	{
		return str.split("").join("\\");
	}


	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('myrooms')
	async getMyRooms(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let fields = ["name", "type", "users", "protection", "allowed_users"];
		const rooms = await this.chatService.getMyRooms(req.user.username, fields);
		if (!rooms)
		{
			printCallerError(`controllerror: true, code: 'ROOMS_NOT_FOUND', message: 'rooms not found for ${req.user.username}'`);
			throw new HttpException({ error: true, code: 'ROOMS_NOT_FOUND', message: `rooms not found for ${req.user.username}` }, HttpStatus.UNPROCESSABLE_ENTITY);
		}
		const blocked = await this.chatService.getListBlockUser(req.user.username);
		if (!blocked)
		{
			printCallerError(`controllerror: true, code: 'USERS_NOT_FOUND', message: 'blocked users not found for ${req.user.username}'`);
			throw new HttpException({ error: true, code: 'USERS_NOT_FOUND', message: `blocked users not found for ${req.user.username}` }, HttpStatus.UNPROCESSABLE_ENTITY);
		}

		let filtered_rooms = rooms.filter(room =>
		{
			if (room.type === 'direct')
			{
				let roomname = room.users[0];
				if (roomname === req.user.username)
					roomname = room.users[1];
				if (blocked.includes(roomname))
					return false;
			}
			return true;
		});

		const ret_rooms = filtered_rooms.map(room =>
		{
			let new_room = this.format_room(room);
			if (room.protection)
			{
				if (room.allowed_users.includes(req.user.username))
					new_room.allowed = true;
				else
					new_room.allowed = false;
			}
			return new_room;
		});

		res.status(HttpStatus.OK).json({ rooms: ret_rooms });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('currentroom')
	async getCurrentRoom(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const current_room_name = await this.chatService.getCurrentRoomName(req.user.username);
		if (!current_room_name)
		{
			printCallerError(`controllerror: true, code: 'ROOM_NOT_FOUND', message: 'current room not found for ${req.user.username}'`);
			throw new HttpException({ error: true, code: 'ROOM_NOT_FOUND', message: `current room not found for ${req.user.username}` }, HttpStatus.UNPROCESSABLE_ENTITY);
		}
		const current_room = await this.chatService.getRoomByName(current_room_name);

		const ret_room = this.format_room(current_room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('allrooms')
	async getAllRooms(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const rooms: roomDto[] = await this.chatService.getAllOtherRoomsAndUsers(req.user.username)
		const blocked = await this.chatService.getListBlockUser(req.user.username);

		let filtered_rooms = rooms.filter(room =>
		{
			if (room.type === 'user')
			{
				if (blocked.includes(room.name))
					return false;
			}
			return true;
		});

		const ret_rooms = filtered_rooms.map(room => this.format_room(room));
		res.status(HttpStatus.OK).json({ rooms: ret_rooms });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('setadmin')
	async setAdmin(@Body('username') username: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const current_room_name = await this.chatService.getCurrentRoomName(req.user.username);
		await this.chatService.setAdmin(req.user.username, username, current_room_name);

		let message = `${username} is now admin`;
		await this.chatService.addMessageToRoom(current_room_name, "SERVER", message);
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		let server = this.chatGateway.server;
		await server.in(socket.room).emit('message', "SERVER", message);

		res.status(HttpStatus.OK).json({ message: `${username} is now admin in room ${current_room_name}` });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('isadmin')
	async isAdmin(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(req.user.username);
		const fields = ["admins"];
		const room_db = await this.chatService.getRoomByName(room_name, fields);
		const is_admin = room_db.admins.includes(req.user.username);

		res.status(HttpStatus.OK).json({ condition: is_admin });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('current')
	async setCurrentRoom(@Body() setCurrentRoomDto: setCurrentRoomDto, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const response = await this.chatService.setCurrentRoom(req.user.username, setCurrentRoomDto.name);
		res.status(HttpStatus.OK).json({ message: response });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('allowedchars')
	async allowedChars(@Res() res): Promise<void>
	{
		printCaller("- in ");

		res.status(HttpStatus.OK).json({ chars: this.allowed_chars });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('create')
	async createRoom(@Body() room: roomDto, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		// check chars in room name
		let chars = this.escape_chars(this.allowed_chars);
		let regex_base = `[a-zA-Z0-9\\s${chars}]`;
		let test_regex = new RegExp(`^${regex_base}+$`);
		if (test_regex.test(room.name) === false)
		{
			let forbidden_chars = room.name.replace(new RegExp(regex_base, "g"), "");
			printCaller(`throw error: error: true, code: 'FORBIDDEN_CHARACTERS', message: 'Your room name can not contains these characters : ${forbidden_chars}'`);
			throw new HttpException({ error: true, code: 'FORBIDDEN_CHARACTERS', message: `Your room name can not contains these characters : ${forbidden_chars}` }, HttpStatus.UNPROCESSABLE_ENTITY);
		}

		// check for password protection
		if (typeof room.protection === 'undefined')
			room.protection = false;
		else if (room.protection === true)
		{
			if (!room.password || room.password.length === 0)
			{
				printCaller(`throw error: error: true, code: 'PASSWORD_INVALID', message: 'your password is invalid'`);
				throw new HttpException({ error: true, code: 'PASSWORD_INVALID', message: `your password is invalid` }, HttpStatus.UNPROCESSABLE_ENTITY);
			}
		}

		room.users = [req.user.username];
		await this.chatService.addUserToNewRoom(req.user.username, room);

		if (room.protection)
		{
			let message = `${req.user.username} changed the password`;
			room.allowed_users = [req.user.username];
			await this.chatService.setPassword(req.user.username, message, room);
			let socket: socketDto = this.chatService.getSocket(req.user.username);
			await socket.to(socket.room).emit('message', "SERVER", message);
		}

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('join')
	async joinRoom(@Body() room: roomDto, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let response = "";
		if (room.type === 'user')
		{
			const blocked = await this.chatService.getListBlockUser(req.user.username);
			if (blocked.includes(room.name))
			{
				console.error("throw error: error: true, code: 'BLOCKED_USER', message: 'you cannot enter this room, you blocked this user'");
				throw new HttpException({ error: true, code: 'BLOCKED_USER', message: `you cannot enter this room, you blocked this user` }, HttpStatus.UNAUTHORIZED);
			}

			const find_room = await this.chatService.getRoomByName(`${req.user.username} + ${room.name}`);
			if (find_room)
			{
				console.error("throw error: error: true, code: 'ROOM_CONFLICT', message: 'This room name already exist'");
				throw new HttpException({ error: true, code: 'ROOM_CONFLICT', message: `This room name already exist` }, HttpStatus.CONFLICT);
			}
			room.type = 'direct';
			room.users = [room.name, req.user.username];
			room.name += ` + ${req.user.username}`;
			room.owner = req.user.username;
			await this.chatService.addUserToNewRoom(req.user.username, room);
		}
		else
		{
			let fields = ["name", "type", "users", "messages", "owner", "protection"];
			const room_db = await this.chatService.getRoomByName(room.name, fields);
			if (room_db.type === 'direct')
			{
				console.error("throw error: error: true, code: 'JOIN_DIRECT_FORBIDDEN', message: 'cannot join a direct messages room'");
				throw new HttpException({ error: true, code: 'JOIN_DIRECT_FORBIDDEN', message: `cannot join a direct messages room` }, HttpStatus.CONFLICT);
			}
			if (room_db.type === 'private')
			{
				console.error("throw error: error: true, code: 'JOIN_PRIVATE_FORBIDDEN', message: 'cannot join a private room'");
				throw new HttpException({ error: true, code: 'JOIN_PRIVATE_FORBIDDEN', message: `cannot join a private room` }, HttpStatus.CONFLICT);
			}
			if (room_db.users.includes(req.user.username))
			{
				console.error("throw error: error: true, code: 'ALREADY_JOIN', message: 'your have already joined this room'");
				throw new HttpException({ error: true, code: 'ALREADY_JOIN', message: `your have already joined this room` }, HttpStatus.CONFLICT);
			}
			room = await this.chatService.addUserToRoom(req.user.username, room.name);
		}

		let socket: socketDto = this.chatService.getSocket(req.user.username);
		await this.chatService.socketJoinRoom(socket, room.name);

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('change')
	async changeRoom(@Body() room: roomDto, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let fields = ["protection", "allowed_users", "type", "users"];
		const room_db = await this.chatService.getRoomByName(room.name, fields);

		if (!room_db.users.includes(req.user.username))
		{
			console.error("throw error: error: true, code: 'NEED_JOIN', message: 'you didn't join this room'");
			throw new HttpException({ error: true, code: 'NEED_JOIN', message: `you didn't join this room` }, HttpStatus.UNAUTHORIZED);
		}

		if (room_db.protection === true)
		{
			if (!room_db.allowed_users.includes(req.user.username))
			{
				console.error("throw error: error: true, code: 'NEED_AUTHENTICATE', message: 'You didn't provide the password for this room'");
				throw new HttpException({ error: true, code: 'NEED_AUTHENTICATE', message: `You didn't provide the password for this room` }, HttpStatus.UNAUTHORIZED);
			}
		}

		const blocked = await this.chatService.getListBlockUser(req.user.username);
		if (room_db.type === 'direct')
		{
			let roomname = room_db.users[0];
			if (roomname === req.user.username)
				roomname = room.users[1];
			if (blocked.includes(roomname))
			{
				console.error("throw error: error: true, code: 'BLOCKED_USER', message: 'you cannot enter this room, you blocked this user'");
				throw new HttpException({ error: true, code: 'BLOCKED_USER', message: `you cannot enter this room, you blocked this user` }, HttpStatus.UNAUTHORIZED);
			}
		}

		await this.chatService.setCurrentRoom(req.user.username, room.name);
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		await this.chatService.socketChangeRoom(socket, room.name);

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('passwordauth')
	async passwordAuthentication(@Body() room: roomDto, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let fields = ["protection", "allowed_users"];
		const room_db = await this.chatService.getRoomByName(room.name, fields);
		if (room_db.protection === true)
		{
			if (!room.password)
			{
				console.error("throw error: error: true, code: 'PASSWORD_MISSING', message: 'this room is protected, you need to provide a password'");
				throw new HttpException({ error: true, code: 'PASSWORD_MISSING', message: `this room is protected, you need to provide a password` }, HttpStatus.UNAUTHORIZED);
			}
			if (!room_db.allowed_users.includes(req.user.username))
				await this.chatService.setPasswordValidation(req.user.username, room);
		}

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('changepassword')
	async changePassword(@Body('room') room: roomDto, @Body('old_password') old_password: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let message = `${req.user.username} changed the password`;
		room.allowed_users = [req.user.username];
		room.protection = true;
		await this.chatService.setPassword(req.user.username, message, room, old_password);

		// inform other connected users
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		await socket.to(socket.room).emit('message', "SERVER", message);
		await socket.to(socket.room).emit('new_password');

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('addpassword')
	async addPassword(@Body() room: roomDto, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let message = `${req.user.username} added a password`;
		room.allowed_users = [req.user.username];
		room.protection = true;
		await this.chatService.setPassword(req.user.username, message, room);

		// inform other connected users
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		await socket.to(socket.room).emit('message', "SERVER", message);
		await socket.to(socket.room).emit('new_password');

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Delete('removepassword')
	async removePassword(@Body() room: roomDto, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let message = `${req.user.username} removed a new password`;
		room.allowed_users = [];
		room.protection = false;
		await this.chatService.removePassword(req.user.username, message, room);

		// inform other connected users
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		await socket.to(socket.room).emit('message', "SERVER", message);

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('invite')
	async inviteUser(@Body('username') username: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");


		const blocked = await this.chatService.getListBlockUser(req.user.username);
		if (blocked.includes(username))
		{
			console.error("throw error: error: true, code: 'BLOCKED_USER', message: 'you cannot invite this user, you have blocked it'");
			throw new HttpException({ error: true, code: 'BLOCKED_USER', message: `you cannot invite this user, you have blocked it` }, HttpStatus.UNAUTHORIZED);
		}

		let current_room_name = await this.chatService.getCurrentRoomName(req.user.username);
		let room = await this.chatService.addUserToRoom(username, current_room_name);
		let message = `${username} joined the room`;
		await this.chatService.addMessageToRoom(current_room_name, "SERVER", message);

		const ret_room = this.format_room(room);
		res.status(HttpStatus.OK).json({ room: ret_room });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Delete('leave')
	async leaveRoom(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(req.user.username);
		let messages: string[] = await this.chatService.removeUserFromRoom(req.user.username, room_name);

		// set current room to nothing
		await this.chatService.setCurrentRoom(req.user.username, "");

		// leaving message
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		await messages.forEach((message) =>
		{
			this.chatService.addMessageToRoom(room_name, "SERVER", message);
			socket.to(socket.room).emit('message', "SERVER", message);
		});
		await socket.leave(socket.room);

		res.status(HttpStatus.OK).json({ message: messages[0] });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('messages')
	async getMessages(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const messages = await this.chatService.getMessagesFromCurrentRoom(req.user.username);

		const blocked = await this.chatService.getListBlockUser(req.user.username);
		let filtered_messages = messages.filter(message =>
		{
			if (blocked.includes(message.name))
				return false;
			return true;
		});

		res.status(HttpStatus.OK).json({ messages: filtered_messages });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('roomusers')
	async getRoomUsers(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(req.user.username);
		const room = await this.chatService.getRoomByName(room_name);
		const users = room.users;
		const admins = room.admins;
		const blocked = await this.chatService.getListBlockUser(req.user.username);

		let index = users.indexOf(req.user.username);
		if (index > -1)
			users.splice(index, 1);

		let ret_users = users.map(username =>
		{
			let new_user =
			{
				name: username,
				isadmin: false,
				isblocked: false,
			};
			if (admins.includes(username))
				new_user.isadmin = true;
			if (blocked.includes(username))
				new_user.isblocked = true;

			return new_user;
		});

		res.status(HttpStatus.OK).json({ users: ret_users });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('users')
	async getAllUsers(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(req.user.username);
		const users = await this.chatService.getAllUsersNotInRoom(room_name);

		const blocked = await this.chatService.getListBlockUser(req.user.username);
		let filtered_users = users.filter(user =>
		{
			if (blocked.includes(user.username))
				return false;
			return true;
		});

		res.status(HttpStatus.OK).json({ users: filtered_users });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('userinfos')
	async getUserInfos(@Body('username') username: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(username);
		if (!room_name)
		{
			console.error("throw error: error: true, code: 'CURRENT_ROOM_NAME_NOT_FOUND', message: 'current_room_name_not_found'");
			throw new HttpException({ error: true, code: 'CURRENT_ROOM_NAME_NOT_FOUND', message: `current_room_name_not_found` }, HttpStatus.UNAUTHORIZED);
		}
		const current_room = await this.chatService.getRoomByName(room_name);
		if (!current_room)
		{
			console.error("throw error: error: true, code: 'CURRENT_ROOM_NOT_FOUND', message: 'current_room_not_found'");
			throw new HttpException({ error: true, code: 'CURRENT_ROOM_NOT_FOUND', message: `current_room_not_found` }, HttpStatus.UNAUTHORIZED);
		}
		const blocked = await this.chatService.getListBlockUser(req.user.username);
		const mute = await this.chatService.getUserMute(req.user.username, username);

		let user: any = { name: username, ismute: false, mute_date: null };
		user.isadmin = current_room.admins.includes(username);
		if (blocked)
			user.isblocked = blocked.includes(username);
		if (mute && mute.name === username)
		{
			user.ismute = true;
			user.mute_date = mute.date;
		}

		res.status(HttpStatus.OK).json({ user: user });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('setmute')
	async setMuteUser(@Body('mute') mute: muteDto, @Body('time') time: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(req.user.username);
		await this.chatService.addMute(req.user.username, room_name, mute);

		// inform other connected users
		let message = `${req.user.username} has muted ${mute.name} untill ${time}`;
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		let server = this.chatGateway.server;
		await this.chatService.addMessageToRoom(room_name, "SERVER", message);
		await server.in(socket.room).emit('message', "SERVER", message);

		const room = await this.chatService.getRoomByName(room_name);

		res.status(HttpStatus.OK).json({ message: message });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('ismute')
	async isUserMute(@Body('username') username: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(req.user.username);
		const current_room = await this.chatService.getRoomByName(room_name);
		let mute = current_room.mutes.find(mute => mute.name === username);

		res.status(HttpStatus.OK).json({ mute: mute });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('unmute')
	async unMute(@Body('username') username: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		const room_name = await this.chatService.getCurrentRoomName(req.user.username);
		if (!room_name)
		{
			console.error("throw error: error: true, code: 'CURRENT_ROOM_NOT_FOUND', message: 'current_room_not_found'");
			throw new HttpException({ error: true, code: 'CURRENT_ROOM_NOT_FOUND', message: `current_room_not_found` }, HttpStatus.UNAUTHORIZED);
		}

		const fields = ["admins"];
		const room_db = await this.chatService.getRoomByName(room_name, fields);
		const is_admin = room_db.admins.includes(req.user.username);
		if (!is_admin)
		{
			console.error("throw error: error: true, code: 'UNMUTE_NEED_ADMIN', message: 'you cannot unmute a user if you are not admin in the room'");
			throw new HttpException({ error: true, code: 'UNMUTE_NEED_ADMIN', message: `you cannot unmute a user if you are not admin in the room` }, HttpStatus.UNAUTHORIZED);
		}
		
		await this.chatService.removeMute(username, room_name);

		let message = `${req.user.username} has un-muted ${username}`;
		let socket: socketDto = this.chatService.getSocket(req.user.username);
		let server = this.chatGateway.server;
		await this.chatService.addMessageToRoom(room_name, "SERVER", message);
		await server.in(socket.room).emit('message', "SERVER", message);

		res.status(HttpStatus.OK).json({ message: "successfull unmute" });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('block')
	async blockUser(@Body('username') username: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		await this.chatService.addBlockUser(req.user.username, username);

		let user_socket: socketDto = this.chatService.getSocket(req.user.username);
		user_socket.join(`${username}_not_emit`);

		res.status(HttpStatus.OK).json({ message: "successfull block" });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Post('unblock')
	async unBlockUser(@Body('username') username: string, @Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		await this.chatService.removeBlockUser(req.user.username, username);
		let user_socket: socketDto = this.chatService.getSocket(req.user.username);
		user_socket.leave(`${username}_not_emit`);

		res.status(HttpStatus.OK).json({ message: "successfull unblock" });
		printCaller("- out ");
	}

	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	@Get('listblock')
	async listBlockUser(@Req() req, @Res() res): Promise<void>
	{
		printCaller("- in ");

		let block_users = await this.chatService.getListBlockUser(req.user.username);
		let users = block_users.map(user =>
		{
			return {
				name: user,
				isadmin: false,
				isblocked: true,
			}
		});

		res.status(HttpStatus.OK).json({ users: users });
		printCaller("- out ");
	}

}

