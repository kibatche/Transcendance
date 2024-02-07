import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FriendshipsModule } from './friendship/friendships.module';
import { AuthenticationModule } from './auth/42/authentication.module';
import { PassportModule } from '@nestjs/passport';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
		UsersModule,
		AuthenticationModule,
		PassportModule.register({ session: true }),
		FriendshipsModule,
		GameModule,
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.POSTGRES_HOST,
			port: parseInt(process.env.POSTGRES_PORT),
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DATABASE,
			autoLoadEntities: true,
			//ne pas synchroniser quand on est en prod. Trouver un moyen de set ça, sûrement
			//avec une classe pour le module
			synchronize: true,
		}),
		ChatModule,
	],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
