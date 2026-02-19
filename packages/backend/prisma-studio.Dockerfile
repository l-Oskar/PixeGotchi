FROM node:22-alpine

WORKDIR /app

# Встановлюємо тільки необхідні пакети
RUN npm init -y && \
    npm install prisma@7.3.0 @prisma/client@7.3.0 dotenv

# Копіюємо тільки Prisma файли
COPY prisma ./prisma/
COPY prisma.config.ts ./

EXPOSE 51212

CMD ["sh", "-c", "npx prisma generate && BROWSER=none npx prisma studio --port 51212"]