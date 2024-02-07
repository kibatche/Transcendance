FROM node:alpine AS development

WORKDIR /usr/app

COPY ./api_back ./
COPY ./api_back/src/uploads/avatars/default.png ./uploads/avatars/default.png

RUN npm i --force

CMD [ "npm", "run", "start:dev" ]
