import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from '../friendship/entities/friendship.entity';
import { UserStats } from './entities/userStat.entities';
import { FriendshipService } from 'src/friendship/friendship.service';
import { ChatModule } from 'src/chat/chat.module';
import { ChatService } from 'src/chat/chat.service';
import { Chatroom } from 'src/chat/entities/chatroom.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Friendship, UserStats, Chatroom]),
		forwardRef(() => ChatModule),
	],
	providers: [UsersService, FriendshipService, ChatService],
	exports: [UsersService],
	controllers: [UsersController],
})
export class UsersModule {}
