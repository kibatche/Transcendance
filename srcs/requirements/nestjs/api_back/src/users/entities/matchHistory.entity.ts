import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('matchHistory')
export class MatchHistory {
    @PrimaryGeneratedColumn()
    id : number;
    @ManyToOne(type => User, user => user.username, {onDelete: 'CASCADE'})
	playerOne: User;
	@Column()
	playerTwoUsername : string;
    @Column()
    playerOneResult : number;
    @Column()
    playerTwoResult : number;
    @CreateDateColumn()
    date : Date;
}
