#! /usr/bin/env bash

ENV_FILE_DOCKER=./srcs/.env
ENV_FILE_SVELTE=./srcs/requirements/svelte/api_front/.env
NGINX_CONF_FILE=./srcs/requirements/nginx/conf/default.conf
BOLD_RED="\033[1;31m"
BOLD_GREEN="\033[1;32m"
BOLD_BLUE="\033[1;34m"
RESET="\033[0m"

# Function to generate passwords
#
	function generate_password
	{
		# base64 alphabet is alphanumeric characters and "+", "/", "="
		# https://en.wikipedia.org/wiki/Base64#Base64_table_from_RFC_4648
		# we could delete them 'tr -d "+/="', but that would randomly shorten the string
		echo $(openssl rand -base64 32 | tr "/" "_" );
	}

	function make_env_for_svelte
	{
		echo -e "${BOLD_BLUE}Creating a new environment for svelte${RESET}"
		grep "^WEBSITE_" "$ENV_FILE_DOCKER" > "$ENV_FILE_SVELTE"
	}

	function update_nginx_conf
	{
		echo -e "${BOLD_BLUE}Updating the nginx conf${RESET}"
		echo -e "${BOLD_RED}WARNING : If for some reason you've changed the port, you MUST change it inside the nginx conf file. It's not supposed to change.${RESET}"
		HOST=$(grep "^WEBSITE_HOST" $ENV_FILE_DOCKER | cut -d "=" -f 2)
		sed -i "s/server_name.*/server_name $HOST;/g" "$NGINX_CONF_FILE"
	}

	function make_env_for_docker_and_svelte
	{
		docker rm -f postgresql
		docker rm -f nestjs
		docker volume rm -f srcs_data_nest_postgresql
		echo -e "${BOLD_BLUE}Creating a new environment for docker${RESET}"
		NODE_ENV=""
		# Ask if dev or prod environment
		while [ "$NODE_ENV" != "1" ] && [ "$NODE_ENV" != "2" ]; do
			read -p "Enter the env configuration for nestjs : \"1\" for development OR \"2\" for production : " NODE_ENV
		done
		if [ "$NODE_ENV" = "1" ]; then
			echo "NODE_ENV=development"								> "$ENV_FILE_DOCKER"
		else
			echo "NODE_ENV=production"								> "$ENV_FILE_DOCKER"
		fi
		read -p "Enter the name of the host like \"localhost\" : " PROJECT_HOST
		echo "WEBSITE_HOST=$PROJECT_HOST"							>> "$ENV_FILE_DOCKER"
		echo "WEBSITE_PORT=8080"									>> "$ENV_FILE_DOCKER"
		echo "POSTGRES_USER=postgres"								>> "$ENV_FILE_DOCKER"
		echo "#if change postgres pswd, do make destroy"			>> "$ENV_FILE_DOCKER"
		echo "POSTGRES_PASSWORD=$(generate_password)"				>> "$ENV_FILE_DOCKER"
		echo "POSTGRES_DB=transcendance_db"							>> "$ENV_FILE_DOCKER"
		echo "POSTGRES_HOST=postgresql"								>> "$ENV_FILE_DOCKER"
		echo "POSTGRES_PORT=5432"									>> "$ENV_FILE_DOCKER"
		echo "REDIS_HOST=redis"										>> "$ENV_FILE_DOCKER"
		echo "REDIS_PORT=6379"										>> "$ENV_FILE_DOCKER"
		echo "REDIS_PASSWORD=$(generate_password)"					>> "$ENV_FILE_DOCKER"
		# Connection to 42
		echo -e "${BOLD_BLUE}In the next steps, we'll need to enter the client secret and client id of the 42 api${RESET}"
		read -p "Enter the client id of the 42 api : " CLIENT_ID
		echo "FORTYTWO_CLIENT_ID=$CLIENT_ID"						>> "$ENV_FILE_DOCKER"
		read -p "Enter the client secret of the 42 api : " CLIENT_SECRET
		echo "FORTYTWO_CLIENT_SECRET=$CLIENT_SECRET"				>> "$ENV_FILE_DOCKER"
		FT_CALLBACK="http://$PROJECT_HOST:8080/api/v2/auth/redirect"
		echo "FORTYTWO_CALLBACK_URL=$FT_CALLBACK"					>> "$ENV_FILE_DOCKER"
		# Other configs
		echo "COOKIE_SECRET=$(generate_password)"					>> "$ENV_FILE_DOCKER"
		echo "PORT=3000" 											>> "$ENV_FILE_DOCKER"
		echo "TWO_FACTOR_AUTHENTICATION_APP_NAME=Transcendance"		>> "$ENV_FILE_DOCKER"
		echo "TICKET_FOR_PLAYING_GAME_SECRET=$(generate_password)"	>> "$ENV_FILE_DOCKER"
		make_env_for_svelte
		update_nginx_conf
		echo -e "${BOLD_GREEN}Environment created.${RESET}"
		echo -e "${BOLD_GREEN}The script will exit${RESET}"
		exit 0
	}

	function change_host_and_port_api
	{
		if [ -f "$ENV_FILE_DOCKER" ]
		then
			echo -e "${BOLD_BLUE}Changing the host and the port of the api${RESET}"
			read -p "Enter the name of the host like \"localhost\" : " PROJECT_HOST
			sed -i "s/WEBSITE_HOST=.*/WEBSITE_HOST=$PROJECT_HOST/g" "$ENV_FILE_DOCKER"
			read -p "Enter the port of the api : " PROJECT_PORT
			sed -i "s/WEBSITE_PORT=.*/WEBSITE_PORT=$PROJECT_PORT/g" "$ENV_FILE_DOCKER"
			make_env_for_svelte
			update_nginx_conf
		else
			echo -e "${BOLD_RED}No environment file found. We will regenerate the entire env files.${RESET}"
		fi
	}

	function change_api_fields_for_42_auth_api
	{
		if [ -f "$ENV_FILE_DOCKER" ]
		then
			echo -e "${BOLD_BLUE}Changing the secret for the 42 api${RESET}"
			read -p "Enter the client id of the 42 api : " CLIENT_ID
			sed -i "s/FORTYTWO_CLIENT_ID=.*/FORTYTWO_CLIENT_ID=$CLIENT_ID/g" "$ENV_FILE_DOCKER"
			read -p "Enter the client secret of the 42 api : " CLIENT_SECRET
			sed -i "s/FORTYTWO_CLIENT_SECRET=.*/FORTYTWO_CLIENT_SECRET=$CLIENT_SECRET/g" "$ENV_FILE_DOCKER"
			echo -e "${BOLD_GREEN}The fields concerning the 42 api have been changed.${RESET}"
		else
			echo -e "${BOLD_RED}No environment file found. We will regenerate the entire env files.${RESET}"
			make_env_for_docker_and_svelte
		fi
	}


	function choose_options_and_process {
		if [ ! -f "$ENV_FILE_DOCKER" ]; then
			make_env_for_docker_and_svelte
		elif [ ! -f "$ENV_FILE_SVELTE" ] && [ -f "$ENV_FILE_DOCKER" ]; then
			make_env_for_svelte
		fi
		echo -e "${BOLD_RED}An environment already exists.${RESET}"
		echo -e "${BOLD_GREEN}What do you want to do ?${RESET}"
		echo -e "${BOLD_GREEN}1. Regenerate entire environment${RESET}"
		echo -e "${BOLD_GREEN}2. Only change the fields about the HOSTNAME and the PORT of the API${RESET}"
		echo -e "${BOLD_GREEN}3. Only change the fields concerning the 42 API (id and secret)${RESET}"
		echo -e "${BOLD_GREEN}4. Exit${RESET}"
		CHOICE=""
		while [ "$CHOICE" != "1" ] && [ "$CHOICE" != "2" ] && [ "$CHOICE" != "3" ] && [ "$CHOICE" != "4" ]; do
			read -p "Enter your choice : " CHOICE
		done
		if [ "$CHOICE" = "1" ]; then
			make_env_for_docker_and_svelte
		elif [ "$CHOICE" = "2" ]; then
			change_host_and_port_api
		elif [ "$CHOICE" = "3" ]; then
			change_api_fields_for_42_auth_api
		else
			echo -e "${BOLD_GREEN}The script will exit.${RESET}"
			exit 0
		fi
	}

#	Create a new environment for docker

	choose_options_and_process

	echo "The environment has been created successfully. You can now wait for the docker to build the project."

