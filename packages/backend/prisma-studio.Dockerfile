FROM node:18-alpine

WORKDIR /app

# Встановлюємо тільки необхідні пакети
RUN npm init -y && \
    npm install prisma@7.3.0 @prisma/client@7.3.0 dotenv

# Копіюємо тільки Prisma файли
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Генеруємо Prisma Client (опціонально, можна і при запуску)
# RUN npx prisma generate

EXPOSE 51212

# CMD ["npx", "prisma", "studio", "--port", "51212", "--hostname", "0.0.0.0"]