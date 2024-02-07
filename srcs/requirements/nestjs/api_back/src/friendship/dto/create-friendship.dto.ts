import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FriendshipStatus } from '../entities/friendship.entity';

export class CreateFriendshipDto {
	@IsNotEmpty()
	@IsString()
	readonly receiverUsername: string;
	@IsEnum(FriendshipStatus)
	readonly status: FriendshipStatus;
}
