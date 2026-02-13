FROM node:20-alpine

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Встановлюємо залежності
RUN npm install
RUN npx prisma generate

# Копіюємо код
COPY src ./src

EXPOSE 3000

# Запускаємо в dev режимі
CMD ["npm", "run", "dev"]