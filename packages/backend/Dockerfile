# Development stage
FROM node:20-alpine

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Встановлюємо всі залежності
RUN npm install

# Копіюємо весь код
COPY src ./src
COPY prisma ./prisma

# Генеруємо Prisma клієнт
RUN npx prisma generate

# Компілюємо TypeScript
RUN npm run build

# Відкриваємо порт
EXPOSE 3000

# Команда запуску
CMD ["npm", "start"]