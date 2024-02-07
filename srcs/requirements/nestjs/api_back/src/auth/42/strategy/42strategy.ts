import { Strategy, Profile } from "passport-42/lib";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthenticationService } from "../authentication.service";
import { CreateUsersDto } from "src/users/dto/create-users.dto";

@Injectable()
	export class FortyTwoStrategy extends PassportStrategy(Strategy, "42") {
		constructor(private authenticationService: AuthenticationService) {
		super({
		clientID: process.env.FORTYTWO_CLIENT_ID,
		clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
		callbackURL: process.env.FORTYTWO_CALLBACK_URL,
		scope: ["public"],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile, callbackURL: string) {
		console.log("Validate inside strategy.ts");
		console.log(profile.id, profile.username, profile.phoneNumbers[0].value, profile.emails[0].value, profile.photos[0].value);
		const userDTO: CreateUsersDto =  { fortyTwoId: profile.id, username: profile.username, email: profile.emails[0].value, image_url: 'default.png', isEnabledTwoFactorAuth: false , status: "Connected" };
		const user = await this.authenticationService.validateUser(userDTO);
		if (!user)
			throw new UnauthorizedException();
		return user;
	}
}
