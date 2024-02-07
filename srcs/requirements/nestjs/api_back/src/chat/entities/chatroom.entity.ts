import { Entity, Column, CreateDateColumn, ManyToOne, ManyToMany, JoinTable, PrimaryGeneratedColumn } from "typeorm";
import { IsBoolean, IsEmpty, IsInt, IsIn, IsNotEmpty, IsNumber, IsArray, IsString, IsOptional, IsEnum } from "class-validator";
import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { messagesDto } from 'src/chat/dto/messages.dto';
import { muteDto } from 'src/chat/dto/mute.dto';

@Entity('chatroom')
export class Chatroom
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	@IsString()
	@IsNotEmpty()
	name: string;

	@Column()
	@IsString()
	@IsNotEmpty()
	@IsIn(["public", "private", "direct", "user"])
	type: string;

	@Column({ default: false })
	@IsBoolean()
	protection: boolean = false;

	@Column({ nullable: true })
	@IsString()
	@IsOptional()
	hash?: string;

	@Column()
  owner: string; // username

	@Column("simple-array")
	@IsArray()
	@IsString({ each: true })
  admins: string[]; // username

	@Column("simple-array")
	@IsArray()
	@IsString({ each: true })
	users: string[]; // usernames

	// users that can connect without (re)entering password
	// is emptied each time password change
	@Column("simple-array")
	@IsArray()
	@IsString({ each: true })
	allowed_users: string[]; // usernames

	@Column("json")
	messages: messagesDto[];

	@Column("json", { nullable: true })
	@IsOptional()
	mutes?: muteDto[];
}

