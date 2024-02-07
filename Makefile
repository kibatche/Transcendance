DOCKERCOMPOSEPATH=./srcs/docker-compose.yml

all : up

#dev allow hot reload.
up:
	@bash ./make_env.sh
	docker compose -f ${DOCKERCOMPOSEPATH} up -d --build
	@make start
	@docker ps

start:
	docker compose -f ${DOCKERCOMPOSEPATH} start
	docker logs --follow nestjs

re: down up

down:
	docker compose -f ${DOCKERCOMPOSEPATH} -v down

destroy:
	- docker compose -f ${DOCKERCOMPOSEPATH} down -v --rmi all --remove-orphans
	- docker ps -aq |  xargs --no-run-if-empty docker rm -f
	- docker images -aq | xargs --no-run-if-empty docker rmi -f
	- docker volume ls -q | xargs --no-run-if-empty docker volume rm

# temp for hugo, only reinit database
db:
	- docker rm -f postgresql
	- docker rm -f nestjs
	#- docker rm -f redis
	#- docker rm -f game_server
	#- docker rm -f nginx
	#- docker rm -f svelte
	- docker volume rm -f srcs_data_nest_postgresql
	docker compose -f ${DOCKERCOMPOSEPATH} up -d --build
	@make start
	@docker ps


stop:
	docker compose -f ${DOCKERCOMPOSEPATH} stop
