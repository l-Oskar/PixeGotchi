npx prisma migrate dev ? --dotenv .env

# Build

backend % docker build -f prisma-studio.Dockerfile -t fediukv/pixegotchi-prisma-studio:latest .

# Enter Container

docker exec -it pixegotchi-backend-1 sh
docker exec -it pixegotchi-backend-1 sh -c "npx prisma studio"

# Логи конкретного сервісу

docker compose -f docker-compose.yml logs -f backend

# Перевірити, чи бачить бекенд PostgreSQL

docker exec pixegotchi-backend-1 ping postgres

# АБО

docker exec pixegotchi-backend-1 nslookup postgres

# IpTables

sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
