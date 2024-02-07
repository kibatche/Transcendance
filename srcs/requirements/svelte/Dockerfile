FROM node:alpine AS development

WORKDIR /usr/app

COPY ./api_front ./

RUN npm ci

CMD [ "npm", "run", "dev" ]
