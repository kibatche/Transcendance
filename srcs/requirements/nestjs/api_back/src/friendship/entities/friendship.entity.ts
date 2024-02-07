import { IsOptional } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum FriendshipStatus {
	REQUESTED = 'R',
	ACCEPTED = 'A',
	DECLINED = 'D',
	BLOCKED = 'B',
}

@Entity('friendships')
export class Friendship {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	date : Date;

	@ManyToOne(type => User, user => user.username, {onDelete: 'CASCADE'})
	sender: User;

	@ManyToOne(type => User, user => user.username, {onDelete: 'CASCADE'})
	receiver: User;

	@Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.REQUESTED})
	status: FriendshipStatus;
}
