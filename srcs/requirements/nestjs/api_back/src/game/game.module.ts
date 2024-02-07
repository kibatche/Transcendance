import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from 'src/friendship/entities/friendship.entity';
import { FriendshipService } from 'src/friendship/friendship.service';
import { MatchHistory } from 'src/users/entities/matchHistory.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Game } from './entity/game.entity';
import { TokenGame } from './entity/tokenGame.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { ChatModule } from 'src/chat/chat.module';
import { ChatService } from 'src/chat/chat.service';
import { Chatroom } from 'src/chat/entities/chatroom.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([TokenGame, User, Game, Friendship, Chatroom, MatchHistory]),
		ChatModule,
	],
	controllers: [GameController],
	providers: [
		GameService,
		UsersService,
		FriendshipService,
		ChatService,
	]
})
export class GameModule {}
