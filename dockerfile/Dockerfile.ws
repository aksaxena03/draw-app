FROM node:18-alpine

RUN corepack enable

ARG DATABASE_URL
WORKDIR /user/src/app


COPY ./pnpm-lock.yaml ./pnpm-lock.yaml


COPY ./package ./package

COPY ./package.json ./package.json

COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

COPY ./turbo.json ./turbo.json

COPY ./apps/ws-server ./apps/ws-server

RUN pnpm run install
RUN pnpm run db:generate
RUN ${DATABASE_URL} pnpm run build

COPY . .

CMD [ "pnpm" ,"start:ws-server" ]
