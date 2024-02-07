import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { Friendship } from './entities/friendship.entity';
import { User } from '../users/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Friendship, User])],
	providers: [FriendshipService],
	controllers: [FriendshipController],
	exports: [FriendshipService],
})

export class FriendshipsModule {}
