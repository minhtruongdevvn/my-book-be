FROM node:18.16.0-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli

COPY package*.json /main/
COPY ./apps/conversation/package.json /main/apps/conversation/
RUN cd /main && npm install

COPY ./libs /main/libs
COPY ./.env /main/.env
COPY ./nest-cli.json /main/nest-cli.json
COPY ./tsconfig.json /main/tsconfig.json
COPY ./tsconfig.build.json /main/tsconfig.build.json

COPY ./apps/conversation /main/apps/conversation

ENV DATABASE_HOST=postgres
ENV CHATBOX_DB_HOST=mongo
ENV WORKER_HOST=redis
ENV CHAT_REDIS_HOST=chat-redis
ENV CHAT_REDIS_PORT=6379

WORKDIR /main
RUN npm run conversation:build