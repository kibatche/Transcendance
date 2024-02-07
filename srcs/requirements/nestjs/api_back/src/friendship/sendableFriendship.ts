
import { Friendship, FriendshipStatus } from "./entities/friendship.entity";

export class SendableFriendship {
  id: number;
  date: Date;
  senderUsername: string;
  receiverUsername: string;
  status: FriendshipStatus;

  constructor(friendship: Friendship) {
		this.id = friendship.id;
		this.date = friendship.date
		this.senderUsername = friendship.sender.username;
		this.receiverUsername = friendship.receiver.username;
		this.status = friendship.status;
	};
}