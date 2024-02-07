FROM node:alpine AS build

WORKDIR /usr/app

COPY ./game_back ./

RUN npm install

RUN npx tsc

WORKDIR /usr/app/src/server

EXPOSE 8042

CMD [ "node", "wsServer.js"]
