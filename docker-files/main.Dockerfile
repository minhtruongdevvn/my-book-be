FROM node:18.16.0-alpine

RUN apk add --no-cache bash
RUN npm i -g @nestjs/cli

COPY package*.json /tmp/
COPY ./apps/main-app/package.json /tmp/apps/main-app/
RUN cd /tmp && npm install
RUN mkdir -p /main
RUN cp -r /tmp/node_modules /main/node_modules
RUN rm -rf /tmp

COPY package*.json /main/
COPY ./libs /main/libs
COPY ./.env /main/.env
COPY ./nest-cli.json /main/nest-cli.json
COPY ./tsconfig.json /main/tsconfig.json
COPY ./tsconfig.build.json /main/tsconfig.build.json

COPY ./apps/main-app /main/apps/main-app

ENV DATABASE_HOST=postgres
ENV CHATBOX_DB_HOST=mongo
ENV MAIL_HOST=maildev
ENV WORKER_HOST=redis

WORKDIR /main
RUN npm run main:build