rm -rf node_modules
rm -rf packages/\*\*/node_modules
rm -f package-lock.json
rm -rf ~/.npm/\_cacache
rm -rf ~/.cache/esbuild

docker-compose up -d postgres redis
