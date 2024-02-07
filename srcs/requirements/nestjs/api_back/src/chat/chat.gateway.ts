import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { WebSocketGateway, SubscribeMessage, WebSocketServer, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';
import { socketDto } from './dto/socket.dto';
import { printCaller, printCallerError, sockets, socket_server } from './dev/dev_utils';
import { Server } from 'socket.io';

@WebSocketGateway(5000, {
	path: '/chat',
})

export class ChatGateway
implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor
	(
		private usersService: UsersService,
		private chatService: ChatService,
	) {}

  @WebSocketServer()
  server: Server;

	async handleConnection(socket: socketDto)
	{
		printCaller('- socket connected :', socket.id, socket.handshake.query.username);

		socket.username = socket.handshake.query.username.toString();

		if (!socket.username)
			return;
		printCaller("--- socket.username:", socket.username);

		// save socket and server
		this.chatService.addSocket(socket.username, socket);
		socket_server.server = this.server;

		// check if socket already exist and delete if it does
		printCaller("---- socket.username", socket.username);
		let serveur_console: any = this.server;
		await serveur_console.sockets.sockets.forEach((sock: any) => printCaller(sock.id, sock.username));
		await serveur_console.sockets.adapter.rooms.forEach((value, key) =>
		{
			printCaller("");
			printCaller("room name:", key);
			printCaller("room users id:");
			printCaller(value);
		});

		let not_emit: string = `${socket.username}_not_emit`;
		socket.join(not_emit);
		let blocked = await this.chatService.getListBlockUser(socket.username);
		blocked.forEach(user =>
		{
			not_emit = `${user}_not_emit`;
			socket.join(not_emit);
		});

		let current_room = await this.chatService.getCurrentRoomName(socket.username);
		if (current_room)
			socket.join(current_room);
	}

	async handleDisconnect(socket: socketDto) {
		printCallerError("handleDisconnect");
		printCaller("---- socket.username", socket.username);

		let serveur_console: any = this.server;
		await serveur_console.sockets.sockets.forEach((sock: any) => printCaller(sock.id, sock.username));
		await serveur_console.sockets.adapter.rooms.forEach((value, key) =>
		{
			printCaller("");
			printCaller("room name:", key);
			printCaller("room users id:");
			printCaller(value);
		});

		this.chatService.removeSocket(socket.username);
	}

	@SubscribeMessage('join')
	async joinRoom(@ConnectedSocket() socket: socketDto, @MessageBody() room_name: string): Promise<void>
	{
		printCaller('- in joinRoom gateway');

		await this.chatService.socketJoinRoom(socket, room_name)

		printCaller('- out joinRoom gateway');
	}

	@SubscribeMessage('change')
	async changeRoom(@ConnectedSocket() socket: socketDto, @MessageBody() room_name: string): Promise<void>
	{
		printCaller('- in changeRoom gateway');
		await this.chatService.socketChangeRoom(socket, room_name);
		printCaller('- out changeRoom gateway');
	}

	@SubscribeMessage('message')
	async handleMessage(@ConnectedSocket() socket: socketDto, @MessageBody() message: string): Promise<void>
	{
		printCaller('- in handleMessage gateway');

		await this.chatService.socketIncommingMessage(socket, message);
		printCaller('- out handleMessage gateway');
	}
}

