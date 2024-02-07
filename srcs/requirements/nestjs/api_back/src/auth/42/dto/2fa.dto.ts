import { IsEmpty, IsString } from "class-validator";

export class TwoFaDto {
	@IsString()
	readonly twoFaCode: string;
}
