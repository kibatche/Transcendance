// Les types partiels permettent d'importer toutes les variables d'une classe
// et de les mettre comme optionnelles. De plus on peut hériter
// des décorateurs de la classe parente (par exemple @IsString()).

import { OmitType } from "@nestjs/mapped-types";
import { CreateUsersDto } from "./create-users.dto";

export class UpdateUsersDto extends OmitType(CreateUsersDto, ['fortyTwoId', 'email', 'image_url', 'status'] as const){}
