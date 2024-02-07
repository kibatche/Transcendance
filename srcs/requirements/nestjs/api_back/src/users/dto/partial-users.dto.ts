import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateUsersDto } from "./create-users.dto";

export class PartialUsersDto extends OmitType(CreateUsersDto, ['fortyTwoId', 'email'] as const){}
