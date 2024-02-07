import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') {
	async canActivate(context: ExecutionContext): Promise<any> {
		const activate = (await super.canActivate(context)) as boolean;
		const request = context.switchToHttp().getRequest();
		await super.logIn(request);
		return activate;
	}
}

@Injectable()
export class AuthenticateGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		console.log("AuthenticateGuard : Is User authenticated : " + request.isAuthenticated());
		return request.isAuthenticated();
	}
}

@Injectable()
export class TwoFactorGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		//console.log("TwoFactorGuard : Is User authenticated : " + request.isAuthenticated() + " and has 2FA enabled : " + request.user.isEnabledTwoFactorAuth + " and has 2FA verified : " + request.user.isTwoFactorAuthenticated);
		return request.isAuthenticated() && (request.user.isEnabledTwoFactorAuth === false
			|| request.user.isTwoFactorAuthenticated === true);
	}
}

