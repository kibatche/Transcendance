import { OmitType } from "@nestjs/mapped-types";
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CreateGameDto } from "./createGame.dto";

export class UpdateGameDto extends OmitType(CreateGameDto, ['playerOneUsername', 'playerTwoUsername', 'gameOptions'] as const){}
