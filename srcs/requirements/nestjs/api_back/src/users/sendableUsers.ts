
import { User } from "./entities/user.entity";
import { UserStats } from "./entities/userStat.entities";

export class SendableUser {
  username: string;
  image_url : string;
  status: string;
  stats: UserStats;

  constructor(user: User) {
		this.username = user.username;
    this.image_url = user.image_url;
		this.status = user.status;
    this.stats = user.stats;
	};
}