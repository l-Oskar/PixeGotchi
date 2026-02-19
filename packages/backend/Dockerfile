FROM node:22-alpine

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Встановлюємо залежності
RUN npm install

# Копіюємо код
COPY src ./src

EXPOSE 3000

# Запускаємо в dev режимі
CMD ["npm", "run", "dev"]