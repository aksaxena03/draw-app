FROM node:18-bullseye-slim

# Add build-time arguments and environment variables
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /usr/src/app

# Copy all package.json files first
COPY package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/backend-comman/package.json ./packages/backend-comman/
COPY packages/common/package.json ./packages/common/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY apps/ws-server/package.json ./apps/ws-server/

# Copy pnpm workspace config
COPY pnpm-workspace.yaml ./

# Update db package.json with required dependencies
RUN cd packages/db && pnpm add -D typescript@5.8.2 @types/node

# Copy source files first
COPY packages/typescript-config ./packages/typescript-config
COPY packages/db ./packages/db
COPY packages/backend-comman ./packages/backend-comman
COPY packages/common ./packages/common
COPY apps/ws-server ./apps/ws-server

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Ensure TypeScript configuration is available
WORKDIR /usr/src/app/packages/typescript-config
RUN echo '{"$schema":"https://json.schemastore.org/tsconfig","compilerOptions":{"declaration":true,"declarationMap":true,"esModuleInterop":true,"incremental":false,"isolatedModules":true,"lib":["es2022","DOM","DOM.Iterable"],"module":"NodeNext","moduleDetection":"force","moduleResolution":"NodeNext","noUncheckedIndexedAccess":true,"resolveJsonModule":true,"skipLibCheck":true,"strict":true,"target":"ES2022"}}' > base.json

# Update and generate Prisma
WORKDIR /usr/src/app/packages/db
RUN pnpm remove @prisma/client prisma && pnpm add prisma@5.22.0 -D && pnpm add @prisma/client@5.22.0

# Install TypeScript and Node types
RUN pnpm add -D typescript@5.8.2 @types/node@20.11.16

# Create local tsconfig for db package
RUN echo '{"compilerOptions":{"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext","esModuleInterop":true,"skipLibCheck":true,"strict":true,"outDir":"dist","rootDir":"src","declaration":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["src","src/generated/prisma"]}' > tsconfig.json

RUN pnpm prisma generate

# Build packages in order
WORKDIR /usr/src/app

# Install and build backend-comman
RUN cd packages/backend-comman && pnpm install && pnpm run build

# Install and build common
RUN cd packages/common && pnpm install && pnpm run build

# Install and build db package
WORKDIR /usr/src/app/packages/db
RUN pnpm install
RUN pnpm run build

# Install and build ws-server
WORKDIR /usr/src/app/apps/ws-server
RUN pnpm install && pnpm run build

WORKDIR /usr/src/app

EXPOSE 8080

CMD ["pnpm", "run", "start:ws-server"]
