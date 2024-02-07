import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticateGuard, TwoFactorGuard } from 'src/auth/42/guards/42guards';
import { User } from 'src/users/entities/user.entity';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { FriendshipService } from './friendship.service';

@Controller('network')
export class FriendshipController {
	constructor(private readonly friendshipService: FriendshipService) { }

	// GET http://transcendance:8080/api/v2/network/myfriends
	@Get('myfriends')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	findOne(@Query('username') otherUsername: string, @Req() req) {
		const user = req.user;
		if (otherUsername !== undefined) {
			return this.friendshipService.findOneRelationshipByUsername(otherUsername, user.username);
		}
		return this.friendshipService.findAllFriendships(user.id);
	}

	// POST http://transcendance:8080/api/v2/network/relations
	@Post('relations')
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	create(@Body() createFriendshipDto: CreateFriendshipDto, @Req() req) {
		const user = req.user;
		if (user.username !== createFriendshipDto.receiverUsername) {
			return this.friendshipService.create(createFriendshipDto, user);
		}
		return new HttpException('You can\'t request a frienship to yourself', HttpStatus.BAD_REQUEST);
	}

	// PATCH http://transcendance:8080/api/v2/network/relations/:relationshipId/accept
	@Patch('relations/:relationshipId/accept')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	updateAccept(@Param('relationshipId') relationshipId: number, @Req() req) {
		const user : User = req.user;
		return this.friendshipService.acceptFriendship(relationshipId, user);
	}

	// PATCH http://transcendance:8080/api/v2/network/relations/:relationshipId/decline
	@Patch('relations/:relationshipId/decline')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	updateDecline(@Param('relationshipId') relationshipId: number, @Req() req) {
		const user : User = req.user;
		return this.friendshipService.declineFriendship(relationshipId, user);
	}

	// PATCH http://transcendance:8080/api/v2/network/relations/:relationshipId/block
	@Patch('relations/:relationshipId/block')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	updateBlock(@Param('relationshipId') relationshipId: number, @Req() req) {
		const user : User = req.user;
		return this.friendshipService.blockFriendship(relationshipId, user);
	}

	// DELETE http://transcendance:8080/api/v2/network/relations/:relationshipId
	@Delete('relations/:relationshipId')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	remove(@Param('relationshipId') relationshipId: number, @Req() req) {
		const user : User = req.user;
		return this.friendshipService.removeFriendship(relationshipId, user);
	}

	// GET http://transcendance:8080/api/v2/network/pending
	@Get('pending')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	findAllPendantFriendshipRequested(@Req() req) {
		const user = req.user;
		return this.friendshipService.findAllPendantRequestsForFriendship(user.id.toString());
	}

	// GET http://transcendance:8080/api/v2/network/received
	@Get('received')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	findAllPendantFriendshipReceived(@Req() req) {
		const user = req.user;
		return this.friendshipService.findAllReceivedRequestsForFriendship(user.id);
	}

	// GET http://transcendance:8080/api/v2/network/blocked
	@Get('blocked')
	@UseGuards(AuthenticateGuard)
	@UseGuards(TwoFactorGuard)
	findBlocked(@Query('relationshipId') relationshipId: number, @Req() req) {
		const user = req.user;
		if (Number.isNaN(relationshipId))
			return this.friendshipService.findAllBlockedFriends(user.id);
		else
			return this.friendshipService.findOneBlocked(relationshipId, user.id);
	}

}
