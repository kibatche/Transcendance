import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from 'src/friendship/entities/friendship.entity';
import { FriendshipService } from 'src/friendship/friendship.service';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { FortyTwoStrategy } from './strategy/42strategy';
import { SessionSerializer } from './utils/serializer';
import { ChatModule } from 'src/chat/chat.module';
import { ChatService } from 'src/chat/chat.service';
import { Chatroom } from 'src/chat/entities/chatroom.entity';

@Module({
	  imports: [TypeOrmModule.forFeature([User, Friendship, Chatroom]),
		UsersModule,
		ChatModule,
	],
	  providers: [
		AuthenticationService,
		FortyTwoStrategy,
		UsersService,
		SessionSerializer,
		FriendshipService,
		ChatService,
	],
	  exports: [AuthenticationService],
	  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
