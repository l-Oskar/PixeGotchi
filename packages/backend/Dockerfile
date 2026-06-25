FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=development

RUN npm install --global npm@11.5.2

# npm workspaces need the root manifest, lockfile, and workspace manifests.
COPY package.json package-lock.json turbo.json ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

RUN npm ci \
  --include-workspace-root \
  --workspace=@pixegotchi/backend \
  --workspace=@pixegotchi/shared

COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Create the initial shared package artifacts before watch mode starts.
RUN npm run build:dev --workspace=@pixegotchi/shared

EXPOSE 3000

CMD ["npx", "turbo", "run", "dev", "--filter=@pixegotchi/backend..."]
