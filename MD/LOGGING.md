# Логування PixeGotchi

Цей документ описує, як працює файлове логування, як увімкнути його на сервері та як шукати потрібні записи.

## Як це працює

Backend використовує один Pino logger. У production кожен запис має формат JSON Lines: один JSON-об’єкт на один рядок.

Логи одночасно потрапляють у два місця:

1. `stdout` backend-контейнера. Їх зберігає Docker і показує команда `docker compose logs`.
2. Persistent-файл на host-сервері:

   ```text
   runtime/logs/backend/backend.log
   ```

У контейнері цей каталог змонтований як `/var/log/pixegotchi`. Тому файл не зникає після restart або rebuild контейнера.

Grafana, Loki та інші додаткові сервіси не використовуються.

## Які події записуються

- запуск і завершення backend;
- завершені HTTP-запити, крім `/health`;
- HTTP-помилки та необроблені винятки;
- прикладні повідомлення backend;
- frontend runtime-помилки;
- `unhandledrejection` у браузері;
- Axios/API-помилки frontend.

Основні поля запису:

| Поле | Значення |
| --- | --- |
| `level` | Числовий рівень Pino |
| `time` | Час у UTC, ISO 8601 |
| `service` | Назва сервісу, зараз `backend` |
| `environment` | `production` або `development` |
| `version` | Git SHA, переданий через `APP_VERSION` |
| `source` | `backend` або `frontend` |
| `event` | Тип події |
| `requestId` | Ідентифікатор backend-запиту |

Рівні Pino:

| Назва | Значення |
| --- | ---: |
| `fatal` | 60 |
| `error` | 50 |
| `warn` | 40 |
| `info` | 30 |
| `debug` | 20 |
| `trace` | 10 |

## Перший запуск на production-сервері

Усі команди виконуються з кореня репозиторію.

### 1. Встановити host logrotate

Це потрібно зробити один раз:

```bash
./scripts/install-logrotate.sh
```

Скрипт:

- створить `runtime/logs/backend/backend.log`;
- визначить Linux-користувача і групу власника файла;
- встановить конфіг у `/etc/logrotate.d/pixegotchi-backend`;
- запустить безпечну debug-перевірку конфігурації.

Якщо репозиторій перенесли в інший каталог, installer потрібно запустити повторно, оскільки logrotate зберігає абсолютний шлях до файла.

### 2. Перебудувати backend-контейнер

```bash
docker compose up -d --build backend
```

Звичайні deploy-скрипти також застосовують потрібні volume та env settings:

```bash
./scripts/deploy.sh
```

або повне перевстановлення Compose stack:

```bash
./scripts/build.sh
```

### 3. Перевірити роботу

```bash
docker compose ps backend
docker compose logs --tail=20 backend
ls -lh runtime/logs/backend/backend.log
tail -n 5 runtime/logs/backend/backend.log
```

Після будь-якого API-запиту, крім `/health`, у файлі має з’явитися подія `http_request_completed`.

## Як дивитися логи

### Docker logs у реальному часі

```bash
docker compose logs -f --tail=200 backend
```

Логи за останні 30 хвилин:

```bash
docker compose logs --since=30m backend
```

### Persistent-файл у реальному часі

```bash
tail -f runtime/logs/backend/backend.log
```

Останні 200 записів:

```bash
tail -n 200 runtime/logs/backend/backend.log
```

Відкрити файл із навігацією та пошуком:

```bash
less runtime/logs/backend/backend.log
```

У `less` натисни `/`, введи текст для пошуку та натисни Enter. Клавіша `n` переходить до наступного збігу, `q` закриває файл.

## Пошук і фільтрація

Для зручної роботи з JSON бажано встановити `jq`.

Форматувати записи в реальному часі:

```bash
tail -f runtime/logs/backend/backend.log | jq -R 'fromjson? // .'
```

Тільки error і fatal:

```bash
jq 'select(.level >= 50)' runtime/logs/backend/backend.log
```

Тільки warning:

```bash
jq 'select(.level == 40)' runtime/logs/backend/backend.log
```

Тільки frontend-помилки:

```bash
jq 'select(.event == "client_error")' runtime/logs/backend/backend.log
```

Пошук backend-запиту за `requestId`:

```bash
jq 'select(.requestId == "REQUEST_ID")' runtime/logs/backend/backend.log
```

Пошук початкового request ID усередині frontend-помилки:

```bash
jq 'select(.client.requestId == "REQUEST_ID")' runtime/logs/backend/backend.log
```

Пошук без `jq`:

```bash
grep '"level":50' runtime/logs/backend/backend.log
grep 'client_error' runtime/logs/backend/backend.log
grep 'REQUEST_ID' runtime/logs/backend/backend.log
```

## Frontend-помилки

Production frontend надсилає помилки на:

```text
POST /api/logs/client
```

Захист endpoint:

- максимум 16 KB на payload;
- тільки дозволені поля;
- 10 запитів за хвилину на IP;
- максимум 5 подій за хвилину на одному клієнті;
- однакові події дедуплікуються протягом 60 секунд;
- JWT використовується, якщо користувач уже авторизований;
- response body, Authorization і URL query не надсилаються.

У development frontend нічого не відправляє на server endpoint.

## Ротація і зберігання

Docker зберігає максимум три stdout-файли по 20 MB:

```yaml
max-size: 20m
max-file: 3
```

Persistent `backend.log` обслуговує host logrotate:

- перевірка щодня;
- додаткова ротація після 20 MB;
- 7 rotated-файлів;
- старі файли стискаються;
- `copytruncate` дозволяє не перезапускати backend.

За невеликого потоку 7 rotated-файлів приблизно відповідають семи дням. Якщо файл часто досягає 20 MB, історія може бути коротшою.

Переглянути rotated-файли:

```bash
ls -lh runtime/logs/backend/
zless runtime/logs/backend/backend.log.2.gz
```

Перевірити конфіг без ротації:

```bash
sudo logrotate --debug /etc/logrotate.d/pixegotchi-backend
```

Примусово протестувати ротацію:

```bash
sudo logrotate --force /etc/logrotate.d/pixegotchi-backend
```

## Налаштування

Docker Compose підтримує такі env-змінні:

| Змінна | Default | Призначення |
| --- | --- | --- |
| `NODE_ENV` | `production` | Режим backend |
| `LOG_LEVEL` | `info` | Мінімальний рівень логування |
| `LOG_TO_FILE` | `true` | Увімкнути persistent-файл |
| `LOG_FILE_PATH` | `/var/log/pixegotchi/backend.log` | Шлях усередині контейнера |
| `APP_VERSION` | `unknown` | Версія застосунку; deploy-скрипти передають Git SHA |

Приклад тимчасового запуску з debug-логами:

```bash
LOG_LEVEL=debug docker compose up -d backend
```

Локальний запуск без файлових логів:

```bash
NODE_ENV=development LOG_TO_FILE=false docker compose up backend
```

## Безпека

Logger приховує відомі секретні поля, зокрема Authorization, cookies, JWT, паролі, токени та Telegram `initData`. Frontend-події додатково очищаються на backend.

Не додавай у log message повні request/response body, database URLs або довільні об’єкти з персональними даними. Автоматичне приховування — це останній захист, а не заміна обережного логування.

Рекомендовані permissions:

```bash
chmod 750 runtime/logs/backend
chmod 640 runtime/logs/backend/backend.log
```

## Типові проблеми

### `backend.log` не створився

Перевір env усередині контейнера:

```bash
docker compose exec backend printenv NODE_ENV LOG_TO_FILE LOG_FILE_PATH
```

Перевір volume і права:

```bash
ls -ld runtime runtime/logs runtime/logs/backend
docker compose exec backend sh -c 'test -w /var/log/pixegotchi && echo writable'
```

Після зміни Compose недостатньо виконати `docker restart`. Контейнер потрібно перестворити:

```bash
docker compose up -d --build backend
```

### Логи є у Docker, але немає у файлі

Перевір, що `LOG_TO_FILE=true` і `LOG_FILE_PATH=/var/log/pixegotchi/backend.log`. Потім переглянь startup-помилки:

```bash
docker compose logs --tail=100 backend
```

### Logrotate не працює

```bash
sudo logrotate --debug /etc/logrotate.d/pixegotchi-backend
sudo cat /etc/logrotate.d/pixegotchi-backend
```

Перевір, що шлях у конфігу збігається з поточним розташуванням репозиторію. Якщо ні — повторно запусти:

```bash
./scripts/install-logrotate.sh
```

### Усі frontend-запити отримують один rate limit

Перевір, що production Nginx використовує актуальний конфіг і передає реальний IP:

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Forwarded-Proto $scheme;
```

