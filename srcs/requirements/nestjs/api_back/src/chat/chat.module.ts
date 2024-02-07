import { Module, forwardRef } from '@nestjs/common';
import { FriendshipsModule } from 'src/friendship/friendships.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';
import { Chatroom } from './entities/chatroom.entity';
import { User } from 'src/users/entities/user.entity';
import { Friendship } from 'src/friendship/entities/friendship.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Chatroom, User, Friendship]),
		FriendshipsModule,
		forwardRef(() => UsersModule),
	],
  controllers: [
		ChatController,
	],
	exports: [],
	providers: [
		ChatService,
		ChatGateway,
	],
})

export class ChatModule {}

