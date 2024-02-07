import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('game')
export class Game {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	playerOneUsername: string

	@Column()
	playerTwoUsername: string

	@Column({default : 0, nullable : true})
	playerOneUsernameResult : number

	@Column({default : 0, nullable : true})
	playerTwoUsernameResult : number

	@Column({default : 0})
	gameOptions: number

	@Column({unique : true})
	gameServerIdOfTheMatch: string

	@Column({default: false, nullable : true}) //éric pourra trouver un meilleur mot : ongoing ?
	isMatchIsFinished: boolean
}
