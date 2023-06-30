# My Book - Facebook functional clone app (back-end)

**This project setup is based on https://github.com/brocoders/nestjs-boilerplate**

## Table of Contents

- [My Book - Facebook functional clone app (back-end)](#my-book---facebook-functional-clone-app-back-end)
  - [Table of Contents](#table-of-contents)
  - [Quick run](#quick-run)
  - [Comfortable development](#comfortable-development)
  - [Links](#links)
  - [Automatic update of dependencies](#automatic-update-of-dependencies)
  - [Database utils](#database-utils)
  - [Tests](#tests)
  - [Tests in Docker](#tests-in-docker)
  - [Test benchmarking](#test-benchmarking)

## Quick run

```bash
git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
cd my-app/
cp env-example .env
docker compose up -d
```

For check status run

```bash
docker compose logs
```

## Comfortable development

```bash
git clone --depth 1 https://github.com/brocoders/nestjs-boilerplate.git my-app
cd my-app/
cp env-example .env
```

Delete all comments in .env

Run additional container:

```bash
docker compose up -d postgres mongo adminer mongo-express maildev redis chat-redis
```

```bash
npm install

npm run migration:run

npm run seed:run

npm run start:dev
```

## Links

- Swagger: http://localhost:3000/docs
- Adminer (client for DB): http://localhost:8081
- Maildev: http://localhost:1080

## Automatic update of dependencies

Todo: connect [Renovate](https://github.com/marketplace/renovate) for the project.

## Database utils

Generate migration

```bash
npm run migration:generate -- src/database/migrations/CreateNameTable
```

Run migration

```bash
npm run migration:run
```

Revert migration

```bash
npm run migration:revert
```

Drop all tables in database

```bash
npm run schema:drop
```

Run seed

```bash
npm run seed:run
```

## Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e
```

## Tests in Docker

```bash
docker compose -f docker-compose.ci.yaml --env-file env-example -p ci up --build --exit-code-from api && docker compose -p ci rm -svf
```

## Test benchmarking

```bash
docker run --rm jordi/ab -n 100 -c 100 -T application/json -H "Authorization: Bearer USER_TOKEN" -v 2 http://<server_ip>:3000/api/v1/users
```
