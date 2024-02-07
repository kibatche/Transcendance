import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('stats')
export class UserStats {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: 0 })
	winGame: number;

	@Column({ default: 0 })
	loseGame: number;

	@Column({ default: 0 })
	drawGame: number;

	@Column({ default: 0 })
	totalGame: number;
}
