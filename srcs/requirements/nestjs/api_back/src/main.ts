import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as redis from 'redis';
import * as connectRedis from 'connect-redis';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });
	const port = process.env.PORT || 3000;
	const client = redis.createClient(
		{
			socket: { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT) },
			legacyMode: true,
		}
	);
	client.connect();
	const RedisStore = connectRedis(session);
	client.on('connect', () => {
		console.log("Redis successfully Connected");
	});

	// module afin de créer un pipe de validation qui va nous aider
	// à valider les données qui sont envoyées par les utilisateurs
	app.useGlobalPipes(
		new ValidationPipe({
			//permet une liste blanche
			whitelist: true,
			//interdit les propriétés non autorisées
			forbidNonWhitelisted: true,
			//permet de transformer les données en fonction de leur type
			transform: true,
			transformOptions: {//permet de transformer les données en fonction de leur type
				enableImplicitConversion: true,
			},
		}),
	);
	app.setGlobalPrefix('api/v2');
	app.use(
		session({
			cookie: {
				maxAge: 3600000 * 24,
			},
			secret: process.env.COOKIE_SECRET,
			resave: false,
			saveUninitialized: false,
			store: new RedisStore({ client }),
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());
	await app.listen(port, () => { console.log(`Listening on port ${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}}`); });
}
bootstrap();
