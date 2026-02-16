npx prisma migrate dev ? --dotenv .env

# Enter Container

docker exec -it pixegotchi-backend-1 sh

# Логи конкретного сервісу

docker compose -f docker-compose.yml logs -f backend
