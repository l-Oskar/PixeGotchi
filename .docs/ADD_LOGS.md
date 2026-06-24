# Файлове логування без Grafana

## Результат

Backend використовує один Pino logger і пише production-логи одночасно:

- у Docker `stdout`, доступний через `docker compose logs`;
- у persistent-файл `runtime/logs/backend/backend.log`.

Grafana, Loki та Alloy на першому етапі не встановлюються. Формат логів — JSON Lines, щоб у майбутньому їх можна було передати в Loki без перероблення backend.

## Реалізація

- Налаштувати єдиний Pino logger для Fastify.
- Додати поля `service`, `environment`, `event`, `requestId`, `source`.
- Приховувати JWT, Authorization, cookies, Telegram `initData`, паролі й токени.
- Замінити runtime `console.*` у backend на структурований logger.
- Логувати завершення HTTP-запитів одним записом; не логувати `/health`.
- Записувати `fatal` для необроблених винятків із flush перед завершенням процесу.
- Видалити невикористаний Winston `packages/logger` і старі закомічені логи.

## Конфігурація та ротація

- Змінні: `LOG_LEVEL=info`, `LOG_TO_FILE=true`, `LOG_FILE_PATH=/var/log/pixegotchi/backend.log`.
- Bind mount: `./runtime/logs/backend:/var/log/pixegotchi`; `runtime/` додати до `.gitignore`.
- Docker rotation: `20 MB × 3` файли.
- Host `logrotate`: щодня або після `20 MB`, 7 архівів, compression і `copytruncate`.
- Grafana, Loki та Alloy поки не встановлювати.

## Frontend-помилки

- Додати `POST /api/logs/client`.
- Приймати runtime, rejected promise та Axios-помилки.
- Body до 16 KB, allowlist полів, очищення секретів на backend.
- JWT опційний; для анонімних запитів — 10 подій/хвилину на IP.
- Не передавати response body, Authorization або URL query.
- Записувати події через Pino з `source: "frontend"`.

## Перевірка

1. Налаштувати backend logger і перевірити обидва destinations.
2. Додати frontend error capture та перевірити redaction/rate limit.
3. Налаштувати Docker і host rotation; перевірити restart та обмеження диска.

Критерії: логи видно через `docker compose logs` і у `backend.log`, вони переживають restart, ротуються, не містять секретів і зберігаються 7 днів.

