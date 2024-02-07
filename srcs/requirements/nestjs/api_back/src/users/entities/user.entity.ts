import { Exclude } from "class-transformer";
import { IsEmail, Length } from "class-validator";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Friendship } from "../../friendship/entities/friendship.entity";
import { MatchHistory } from "./matchHistory.entity";
import { UserStats } from "./userStat.entities";


@Entity('user')
@Unique(['email', 'username'])
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({unique: true})
	fortyTwoId: string;

	@Column({unique: true})
	username: string;

	@Column()
	@IsEmail()
	email: string;

	@Column()
	image_url: string;

	@Column({ nullable: true })
	phone: string;

	@Column({ default: 'Disconnected' })
	status: string;

	// @Column()
	// isFirstConnection: boolean;

	@Column({ default: false, nullable: true })
	isEnabledTwoFactorAuth: boolean;

	@Column({ default:false, nullable: true })
	isTwoFactorAuthenticated: boolean;

	@Column({ nullable: true })
	secretTwoFactorAuth: string;

	@OneToMany(type => Friendship , (friendship) => friendship.sender, {onDelete: 'CASCADE'})
	sentFriendRequest: Friendship[];

	@OneToMany(type => Friendship , (friendship) => friendship.receiver, {onDelete: 'CASCADE'})
	receivedFriendRequest: Friendship[];

	@OneToMany(type => MatchHistory , (matchHistory) => matchHistory.playerOne, {onDelete: 'CASCADE'})
	playerOneMatch: MatchHistory[];


	@JoinColumn()
	@OneToOne(() => UserStats, { cascade: true, onDelete: 'CASCADE' })
	stats: UserStats;


	// ROOMS :

	@Column({ nullable: true })
	currentRoom: string; // chatroom name

}
