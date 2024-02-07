import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tokenGame')
export class TokenGame {

	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	playerOneUsername : string
	@Column({nullable: true})
	playerTwoUsername : string
	@Column()
	gameOptions : number
	@Column()
	isGameIsWithInvitation : boolean
	@Column({default: 0, nullable: true})
	numberOfRegisteredUser : number
	@Column()
	token : string
}
