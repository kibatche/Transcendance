import { PassportSerializer } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";
import { AuthenticationService } from "../authentication.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly authservice : AuthenticationService) {
		super();
	}

	serializeUser(user : User, done : (err : Error, user : User) => void ){
		done(null, user);
	}

	async deserializeUser(user : User, done : (err : Error, user : User) => void){
		const userDB = await this.authservice.findUser(user.fortyTwoId);
		if (userDB)
			done(null, userDB);
		else
			done(null, null);
	}
}
