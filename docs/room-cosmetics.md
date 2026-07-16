# Room Cosmetics: створення assets, реєстрація, запуск і deploy

Цей документ описує повний робочий процес Room Cosmetics у PixeGotchi: від підготовки PNG до появи asset у Room Editor, Company Shop, chest rewards і production database.

> Головне правило: одного PNG у `public/assets/room` недостатньо. Positioned asset потрібно одночасно зареєструвати у frontend-каталозі та backend seed. Ідентифікатор, шлях, slot, positions і span мають збігатися.

## 1. Як влаштована система

Room Cosmetics складається з кількох незалежних частин:

1. PNG-файли лежать у `packages/frontend/public/assets/room`.
2. Category-файли у `MainPage/room/assets/` знають, який PNG рендерити для конкретного `cosmeticAssetId`.
3. `roomAssets.tsx` агрегує category arrays у `ROOM_ASSETS` і будує placements.
4. `seed_room_cosmetics.ts` є серверним каталогом: slot, rarity, ownership rules, positions, shop і chest flags.
5. Prisma зберігає каталог, ownership користувача та поточний room loadout.
6. Room Editor отримує з backend тільки default та owned assets.
7. `PUT /api/room-cosmetics/loadout` атомарно зберігає весь draft.

Основні файли:

- `packages/frontend/src/components/MainPage/room/assets/*.ts` — category-каталоги positioned PNG assets.
- `packages/frontend/src/components/MainPage/room/roomAssets.tsx` — агрегатор `ROOM_ASSETS` і placement builder.
- `packages/frontend/src/components/MainPage/room/roomSlots.ts` — геометрія слотів.
- `packages/frontend/src/components/MainPage/room/roomSurfaces.ts` — стіни та підлоги.
- `packages/frontend/src/components/MainPage/room/RoomScene.tsx` — render layers.
- `packages/frontend/src/components/MainPage/room/roomEditorDraft.ts` — placement/collision logic.
- `packages/frontend/src/index.css` — CSS-текстури стін, підлоги та Room styling.
- `packages/shared/src/types/room_cosmetics.ts` — спільні типи й дозволені positions.
- `packages/backend/prisma/schema.prisma` — database models.
- `packages/backend/src/database/seed_room_cosmetics.ts` — canonical server catalog.
- `packages/backend/src/modules/room-cosmetics` — catalog, ownership, shop і loadout API.
- `packages/backend/src/modules/inventory/inventory.service.ts` — cosmetic chest drops.

## 2. Slot-модель кімнати

| Position | Призначення | Дозволені приклади |
|---|---|---|
| `1` | верхня ліва стіна | картина, настінна поличка |
| `2` | нижня ліва зона | тумба, низька полиця |
| `3` | верхня права стіна | картина, настінна поличка |
| `4` | нижня права зона | тумба, низька полиця |
| `5` | pet | не є cosmetic slot і не зберігається в loadout |
| `6` | window | тільки вікна |
| `7` | curtain | тільки штори; render layer вище вікна |
| `8` | sofa | дивани |
| `9` | rug | килими |
| `10` | лівий floor decor | лампа, рослина, скриня, стопка книг |
| `11` | правий floor decor | той самий тип decor, що й у `10` |
| `1+2` | високий лівий asset | шафа, висока полиця |
| `3+4` | високий правий asset | шафа, висока полиця |

### Collision rules

- Один asset можна встановити лише один раз.
- `span: 1` займає одну position.
- `span: 2` може починатися тільки у `1` або `3` і займає відповідно `1+2` або `3+4`.
- Якщо картина встановлюється у `1`, шафа з `1+2` знімається повністю.
- Якщо шафа встановлюється у `1+2`, assets із `1` і `2` знімаються.
- Такі самі правила працюють для правої пари `3+4`.
- `allowOverlap` зазвичай має бути `false`. Не використовуй його для Window/Curtains: вони вже мають незалежні positions `6` і `7`.

## 3. Вимоги до графіки

### Обов'язкові вимоги

- Формат: `PNG`.
- Color mode: `RGBA`, 8-bit.
- Background: прозорий.
- Імена файлів: lowercase kebab-case, наприклад `oak-nightstand.png`.
- ID і filename бажано робити однаковими: `oak-nightstand` → `oak-nightstand.png`.
- Не додавай порожню рамку на десятки пікселів навколо предмета.
- Нижня точка предмета повинна торкатися нижньої межі canvas: Room використовує `object-position: center bottom`.
- Не обрізай glow, тінь, ніжки чи верхівку предмета.
- Для pixel art вимкни blur/antialiasing під час resize.
- Зберігай цілі пікселі та масштабуй nearest-neighbor.
- Бажано працювати в sRGB.

CSS рендерить PNG так:

```css
.room-asset-slot > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  image-rendering: pixelated;
}
```

Тому Room не вимагає одного абсолютного розміру. Важливі canvas ratio, прозорі поля та однакова pixel density між assets.

## 4. Рекомендовані canvas-розміри

Рекомендовані розміри нижче — це master canvases для нових assets. Можна робити рівно у 2 рази більше, якщо pixel grid також збільшений у 2 рази. Не використовуй довільний 1.37x resize.

| Тип | Slot/position | Runtime bounds у Room | Рекомендований PNG canvas | Поточний еталон |
|---|---|---:|---:|---:|
| Window | `window`, `6` | `28% × 34%` | `160 × 180 px` | `arched-window-day.png` — `133 × 148` |
| Curtains pair | `curtain`, `7` | `46% × 34%` | `320 × 240 px` | `pink-window-curtains.png` — `274 × 218` |
| Wall art | `wallArt`, `1/3` | `22% × 24%` | `96 × 128 px` | `botanical-frame.png` — `66 × 94` |
| Low furniture | `furniture`, `2/4` | `22% × 27%` | `128 × 144 px` | нового еталона ще немає |
| Tall furniture | `furniture`, `1+2/3+4` | `22% × 56%` | `128 × 256 px` | `tall-cabinet-wood.png` — `91 × 218` |
| Sofa | `sofa`, `8` | `42% × 34%` | `320 × 160 px` | `purple-sofa.png` — `318 × 139` |
| Rug | `rug`, `9` | `42% × 25%` | `320 × 128 px` | `purple-oval-rug.png` — `162 × 68` |
| Floor decor | `decor`, `10/11` | `16% × 18%` | `96 × 112 px` | `bonsai-pot.png` — `68 × 74` |

### Пояснення по кожному типу

#### Window

- Малюй раму, скло і внутрішній пейзаж одним PNG.
- Window не повинно містити штори.
- Основний контент центруй по canvas.
- Вікно рендериться на layer `4`.

#### Curtains

- Поточна модель використовує одну картинку з лівою і правою шторами.
- Центр canvas має бути прозорим, щоб було видно Window.
- Не малюй саме вікно всередині PNG.
- Curtains рендеряться на layer `5`, поверх Window.

#### Wall art

- Рама повинна мати невелике прозоре поле, але не більше приблизно `4–8 px` на canvas `96 × 128`.
- Для симетричного asset використовуй `allowedPositions: [1, 3]`.

#### Low furniture

- Контакт із підлогою вирівнюй по низу canvas.
- Для тумб і полиць використовуй positions `[2, 4]`.
- Не використовуй `span: 2`, якщо предмет візуально не займає верхню й нижню зону.

#### Tall furniture

- Canvas має бути вузьким і високим.
- Використовуй `span: 2` та `allowedPositions: [1, 3]`.
- Не додавай positions `2` або `4`: backend відхилить span-2 asset, який не починається з `1` чи `3`.

#### Sofa

- Вся нижня опора дивана має стояти по низу canvas.
- Орієнтуйся на пропорції `purple-sofa.png`; `blue-sofa.png` має нижчу вихідну роздільність і не є найкращим master reference.
- Sofa завжди використовує position `8`.

#### Rug

- Залишай прозорі кути canvas.
- Не додавай перспективний нахил, який конфліктує з підлогою Room.
- Rug завжди використовує position `9`.

#### Floor decor

- Маленькі assets краще малювати трохи більшими всередині canvas, без великих прозорих полів.
- Використовуй `allowedPositions: [10, 11]`, якщо предмет може стояти з обох боків.

## 5. Куди завантажувати PNG

Поточна структура:

```text
packages/frontend/public/assets/room/
├── windows/
├── curtains/
├── furniture/
├── sofas/
├── rugs/
├── wall-art/
└── decor/
```

Приклади:

```text
packages/frontend/public/assets/room/windows/round-window-night.png
packages/frontend/public/assets/room/curtains/blue-window-curtains.png
packages/frontend/public/assets/room/furniture/oak-nightstand.png
packages/frontend/public/assets/room/sofas/green-sofa.png
packages/frontend/public/assets/room/rugs/green-oval-rug.png
packages/frontend/public/assets/room/wall-art/moon-frame.png
packages/frontend/public/assets/room/decor/book-stack.png
```

Sofa зберігаються окремо у `assets/room/sofas/`.

У `assetUrl` не став початковий `/`:

```ts
assetUrl: "assets/room/furniture/oak-nightstand.png"
```

Frontend сам додає `import.meta.env.BASE_URL`. Це важливо для GitHub Pages base `/PixeGotchi/`.

## 6. Як додати новий positioned asset

Нижче — повний приклад нової тумби `oak-nightstand` для positions `2` і `4`.

### Крок 1. Додай PNG

```text
packages/frontend/public/assets/room/furniture/oak-nightstand.png
```

Рекомендований canvas: `128 × 144 px` RGBA.

### Крок 2. Додай frontend render entry у category-файл

Для тумби відкрий:

```text
packages/frontend/src/components/MainPage/room/assets/furniture.ts
```

Додай у `FURNITURE_ROOM_ASSETS`:

```ts
{
  id: "oak-nightstand",
  label: "Oak nightstand",
  src: "assets/room/furniture/oak-nightstand.png",
  slot: 2,
},
```

`ROOM_ASSETS` автоматично збирається через imports/spread у `roomAssets.tsx`. Не додавай окремий item напряму в агрегатор.

| Тип | Category-файл |
|---|---|
| Window | `room/assets/windows.ts` |
| Curtains | `room/assets/curtains.ts` |
| Furniture | `room/assets/furniture.ts` |
| Sofa | `room/assets/sofas.ts` |
| Rug | `room/assets/rugs.ts` |
| Wall Art | `room/assets/wall-art.ts` |
| Decor | `room/assets/decor.ts` |

Category arrays перевіряються через `satisfies readonly RoomAssetDefinition[]`, тому неправильний slot або span type буде видно під час TypeScript build.

Поле `slot` тут є базовою frontend-позицією для каталогу. Реальна position під час render береться із server loadout.

Для Window/Curtains вкажи layer:

```ts
{
  id: "round-window-night",
  label: "Round window",
  src: "assets/room/windows/round-window-night.png",
  slot: 6,
  layer: 4,
},
```

```ts
{
  id: "blue-window-curtains",
  label: "Blue curtains",
  src: "assets/room/curtains/blue-window-curtains.png",
  slot: 7,
  layer: 5,
},
```

Для високої шафи:

```ts
{
  id: "tall-cabinet-blue",
  label: "Tall blue cabinet",
  src: "assets/room/furniture/tall-cabinet-blue.png",
  slot: 1,
  span: 2,
},
```

Якщо цей крок пропустити, asset може з'явитися в Room Inventory, але не буде рендеритися в самій кімнаті.

### Крок 3. Додай backend catalog entry

Відкрий:

```text
packages/backend/src/database/seed_room_cosmetics.ts
```

Додай:

```ts
{
  id: "oak-nightstand",
  name: "Oak nightstand",
  slot: "furniture",
  rarity: "common",
  assetUrl: "assets/room/furniture/oak-nightstand.png",
  environmentId: null,
  allowedPositions: [2, 4],
  span: 1,
  allowOverlap: false,
  isDefault: true,
  isLimited: false,
  isTradable: false,
  isPurchasable: false,
  pgcPrice: null,
  isChestReward: false,
  chestDropWeight: 0,
  isActive: true,
},
```

Для високої шафи:

```ts
allowedPositions: [1, 3],
span: 2,
```

Для Wall Art:

```ts
slot: "wallArt",
allowedPositions: [1, 3],
span: 1,
```

Для Sofa:

```ts
slot: "sofa",
allowedPositions: [8],
span: 1,
```

Для Rug:

```ts
slot: "rug",
allowedPositions: [9],
span: 1,
```

Для Decor:

```ts
slot: "decor",
allowedPositions: [10, 11],
span: 1,
```

Для Window і Curtains:

```ts
// Window
slot: "window",
allowedPositions: [6],

// Curtains
slot: "curtain",
allowedPositions: [7],
```

### Крок 4. Не додавай ID у normalize без потреби

`normalizeRoomEditorAsset()` у `roomEditorDraft.ts` містить кілька legacy overrides для старих assets. Новий asset із правильними server-полями працює без окремого `if (asset.id === ...)`.

Додавай override лише як тимчасову міграційну сумісність, а не як стандартний спосіб реєстрації.

### Крок 5. Запусти seed

```bash
npm run prisma:room-cosmetics --workspace=packages/backend
```

Seed використовує `upsert`:

- створює новий asset;
- оновлює catalog metadata існуючого asset;
- не видаляє ownership;
- не очищає user loadout.

Увага: будь-які ручні зміни catalog fields у database будуть перезаписані наступним seed. Canonical truth — `seed_room_cosmetics.ts`.

### Крок 6. Перевір Room Editor

1. Відкрий Home.
2. Натисни `...` → `Edit Room`.
3. Обери category або slot на сітці.
4. Перевір preview картки.
5. Встанови asset у кожну дозволену position.
6. Перевір collision/replace.
7. Натисни Save.
8. Перезавантаж сторінку та перевір server persistence.

## 7. Як додати нову стіну або підлогу

Стіни та підлоги зараз CSS-rendered, тому для них `assetUrl: null`.

### Крок 1. Додай frontend surface

Файл:

```text
packages/frontend/src/components/MainPage/room/roomSurfaces.ts
```

```ts
// Wall
{ id: "forest-brick", label: "Forest brick", className: "room-wall-forest" }

// Floor
{ id: "forest-boards", label: "Forest boards", className: "room-floor-forest" }
```

### Крок 2. Додай CSS

Файл:

```text
packages/frontend/src/index.css
```

```css
.room-wall-forest {
  background:
    repeating-linear-gradient(
      0deg,
      transparent 0 1.45rem,
      rgb(4 22 14 / 45%) 1.45rem 1.55rem
    ),
    linear-gradient(180deg, #173b2d 0%, #0b2119 100%);
}

.room-floor-forest {
  background:
    repeating-linear-gradient(
      0deg,
      transparent 0 1.15rem,
      rgb(9 19 10 / 48%) 1.15rem 1.28rem
    ),
    linear-gradient(90deg, #29402b 0%, #365338 48%, #213423 100%);
}
```

Не змінюй спільну геометрію `.room-floor-surface`, seam або clip-path заради однієї теми.

### Крок 3. Додай server seed

Wall:

```ts
{
  id: "forest-brick",
  name: "Forest brick",
  slot: "environment",
  rarity: "common",
  assetUrl: null,
  environmentId: null,
  allowedPositions: [],
  span: 1,
  allowOverlap: false,
  isDefault: true,
  isLimited: false,
  isTradable: false,
  isPurchasable: false,
  pgcPrice: null,
  isChestReward: false,
  chestDropWeight: 0,
  isActive: true,
},
```

Для floor зміни тільки `slot: "floor"`.

## 8. Значення catalog flags

| Поле | Значення |
|---|---|
| `isDefault` | Asset доступний кожному без `UserCosmetic` row |
| `isActive` | Неактивний asset не повертається catalog/editor/shop |
| `isLimited` | Limited supply; зараз заборонений для unlimited Company Shop і chest mint |
| `isTradable` | Чи можна передавати через player marketplace |
| `isPurchasable` | Чи показувати у Company Shop |
| `pgcPrice` | Ціна Company Shop; для непокупного asset — `null` |
| `isChestReward` | Чи входить asset до weighted chest pool |
| `chestDropWeight` | Відносна вага серед eligible cosmetic rewards |
| `environmentId` | Майбутня compatibility-прив'язка до environment; зазвичай `null` |
| `allowOverlap` | Дозвіл накладення collision positions; майже завжди `false` |

### Default не означає auto-equipped

`isDefault: true` означає “користувач має право використовувати”. Це не означає, що asset автоматично встановлений.

Default loadout задається окремо у:

```text
packages/backend/src/modules/room-cosmetics/room-cosmetics.service.ts
```

через `DEFAULT_ENVIRONMENT_ID`, `DEFAULT_FLOOR_ID` і `DEFAULT_POSITIONED_ASSETS`.

Не додавай новий asset у default loadout без продуктового рішення та міграції існуючих кімнат.

## 9. Як зробити asset товаром Company Shop

Company Shop і player marketplace — різні системи.

Для звичайного нескінченного PGC offer:

```ts
isDefault: false,
isLimited: false,
isPurchasable: true,
pgcPrice: 400,
isTradable: true, // тільки якщо в майбутньому дозволено player trading
```

Company Shop навмисно не продає `limited` assets.

Після purchase backend:

1. перевіряє active/non-default/non-limited/purchasable;
2. перевіряє, що asset ще не owned;
3. списує PGC;
4. створює `UserCosmetic`;
5. повертає новий баланс;
6. frontend оновлює Shop, ownership та Room Inventory cache.

## 10. Як додати asset у chest rewards

```ts
isDefault: false,
isLimited: false,
isChestReward: true,
chestDropWeight: 100,
```

Поточні шанси cosmetic roll:

| Chest | Chance |
|---|---:|
| Wooden | `0%` |
| Silver | `0%` |
| Golden | `2%` |
| Crystal | `4%` |
| Mythic | `7%` |
| Legendary | `10%` |

`chestDropWeight` не є відсотком. Це вага після успішного cosmetic roll.

Приклад:

- Asset A: weight `100`.
- Asset B: weight `50`.
- Якщо roll успішний і обидва eligible, A має `2/3`, B — `1/3` cosmetic selection chance.

Owned, default, inactive та limited assets виключаються з pool.

## 11. Player marketplace зараз вимкнений

Cosmetic marketplace foundation існує, але вимкнений до спільного marketplace/commission redesign.

За замовчуванням:

- frontend показує `PLAYER MARKETPLACE — COMING SOON`;
- frontend не завантажує listings/ownership для SELL UI;
- backend повертає порожній список listings;
- create/buy/cancel endpoints повертають `503`.

Для майбутнього ввімкнення потрібні обидва flags:

```env
# packages/backend/.env
ENABLE_COSMETIC_MARKETPLACE=true

# packages/frontend/.env
VITE_ENABLE_COSMETIC_MARKETPLACE=true
```

Не вмикай тільки один flag. Перед production enable потрібно завершити спільну commission policy, listing validation і marketplace QA.

## 12. Коли потрібна Prisma migration

### Migration не потрібна

Якщо ти тільки:

- додаєш PNG;
- додаєш новий рядок у `DEFAULT_ROOM_COSMETICS`;
- змінюєш name, rarity, allowedPositions, flags або price;
- додаєш CSS wall/floor;

достатньо оновити код і запустити idempotent seed.

### Migration потрібна

Якщо ти:

- додаєш/видаляєш Prisma field;
- змінюєш enum slot/listing type;
- змінюєш relation/index/constraint;
- переносиш існуючі persisted positions;
- перейменовуєш ID, який уже використовується у ownership/loadout/listings.

Створення migration локально:

```bash
npm run prisma:migrate:dev --workspace=packages/backend
```

На production server не запускай `prisma migrate dev`. Там застосовуються тільки committed migrations:

```bash
npm run prisma:migrate:deploy --workspace=packages/backend
```

## 13. Локальне встановлення та запуск

### Вимоги

- Node.js `22.x`.
- npm `11.x`.
- PostgreSQL 16 або Docker.
- Redis 7 або Docker.

Перевір:

```bash
node --version
npm --version
docker --version
docker compose version
```

### Перша підготовка

```bash
npm install
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```

Для локального frontend API у `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_COSMETIC_MARKETPLACE=false
```

Заповни root `.env` і `packages/backend/.env` реальними database, Redis, JWT і Telegram values.

### Запуск dependencies через Docker

```bash
docker compose up -d postgres redis
```

Перевір:

```bash
docker compose ps
```

### Prisma generate, migrations і seed

Виконуй послідовно:

```bash
npm run prisma:generate --workspace=packages/backend
npm run prisma:migrate:deploy --workspace=packages/backend
npm run prisma:room-cosmetics --workspace=packages/backend
```

### Запуск monorepo

```bash
npm run dev
```

Або окремо:

```bash
# terminal 1
npm run dev --workspace=packages/shared

# terminal 2
npm run backend:dev

# terminal 3
npm run frontend:dev
```

Frontend із поточним Vite base відкривай за адресою:

```text
http://localhost:5173/PixeGotchi/
```

Backend health:

```text
http://localhost:3000/health
```

## 14. Правильний build order

`@pixegotchi/shared` використовується з `dist`, тому після змін shared types спочатку збери shared.

```bash
npm run build --workspace=packages/shared
npm run build --workspace=packages/backend
npm run build --workspace=packages/frontend
```

Повний monorepo build:

```bash
npm run build
```

Frontend preview після build:

```bash
npm run preview --workspace=packages/frontend
```

Vite покаже точну preview URL. Через `base: "/PixeGotchi/"` використовуй path `/PixeGotchi/`.

## 15. Tests і перевірки

### Frontend

```bash
npm run test --workspace=packages/frontend
npm run build --workspace=packages/frontend
```

### Backend

Backend tests потребують test PostgreSQL і Redis. Рекомендований isolated Docker flow:

```bash
npm run backend:test:docker:build
```

Повторний запуск без rebuild:

```bash
npm run backend:test:docker
```

Cleanup:

```bash
npm run backend:test:docker:down
```

### Мінімальний Room Cosmetics smoke checklist

- Catalog endpoint повертає новий asset.
- Default asset видно новому користувачу.
- Non-default asset не видно без ownership.
- Company Shop purchase списує правильну кількість PGC.
- Purchased asset з'являється у Room Inventory.
- Asset ставиться у всі allowed positions.
- Заборонена position не зберігається.
- Span-2 asset витісняє single assets із пари.
- Single asset витісняє span-2 asset.
- Window `6` і Curtains `7` зберігаються разом.
- Save переживає reload.
- Cancel не змінює server room.
- Server error не очищає draft.
- PNG працює на localhost і production `/PixeGotchi/` base.
- 360/390/430 px та вузький tablet не обрізають asset.
- Telegram safe-area не перекриває editor controls.

## 16. Production deploy

### Перед deploy

1. Перевір `git status`.
2. Переконайся, що PNG, frontend catalog і backend seed committed разом.
3. Якщо schema змінювалась — committed migration обов'язкова.
4. Push потрібної branch.

### Backend/server deploy

Для deploy із новими migrations:

```bash
BRANCH=main BUILD=1 RUN_MIGRATIONS=1 ./scripts/deploy.sh
```

Підстав реальну branch замість `main`.

`deploy.sh`:

- перевіряє clean worktree;
- pull-ить branch;
- за потреби build-ить image;
- генерує Prisma client;
- запускає `prisma migrate deploy`, якщо `RUN_MIGRATIONS=1`;
- автоматично запускає Room Cosmetics seed, якщо `SEED_ROOM_COSMETICS` не дорівнює `0`;
- перезапускає backend;
- перевіряє health endpoint.

Не встановлюй:

```bash
SEED_ROOM_COSMETICS=0
```

коли додаєш або змінюєш Room Cosmetics catalog.

### Frontend deploy

```bash
npm run frontend:deploy
```

Ця команда виконує frontend build і публікує `dist` через `gh-pages`.

Переконайся, що production `VITE_API_URL` вказує на правильний `/api`, а `VITE_ENABLE_COSMETIC_MARKETPLACE` не ввімкнений випадково.

## 17. API endpoints

Усі Room Cosmetics endpoints authenticated і мають prefix `/api/room-cosmetics`.

| Method | Endpoint | Призначення |
|---|---|---|
| `GET` | `/catalog` | Active catalog |
| `GET` | `/ownership` | User-owned cosmetics |
| `GET` | `/inventory` | Default + owned assets для editor |
| `GET` | `/shop` | Company Shop offers |
| `GET` | `/loadout` | Current server room |
| `PUT` | `/loadout` | Атомарний Save draft |
| `POST` | `/purchase` | Company Shop purchase |
| `POST` | `/equip` | Legacy/single mutation flow |
| `POST` | `/unequip` | Legacy/single mutation flow |

Editor повинен використовувати локальний draft і робити API mutation тільки під час Save.

## 18. Типові проблеми

### У Room видно тільки alt text

Перевір:

- PNG реально існує у `public/assets/room/...`;
- filename і case збігаються;
- `src` не починається з `/`;
- використовується `import.meta.env.BASE_URL`;
- файл відкривається напряму через dev server;
- PNG не пошкоджений і має RGBA.

### Asset видно в inventory, але не видно в Room

Майже завжди відсутній entry у відповідному `room/assets/*.ts` category-файлі або `id` не збігається із backend seed.

### Asset не видно в Room Inventory

Перевір:

- `isActive: true`;
- для default: `isDefault: true`;
- для non-default: у користувача є `UserCosmetic.quantity > 0`;
- seed був запущений;
- `/api/room-cosmetics/inventory` повертає asset.

### Save повертає 403

Asset має `isDefault: false`, але користувач не має ownership.

### Save повертає 400

Перевір `slot`, `allowedPositions`, `span`, duplicate asset і surface/position mismatch.

### Save повертає 409

У payload є collision двох assets або повторне зайняття position.

### Shop повертає 404 на purchase

Asset не active, default, limited, не purchasable, не має `pgcPrice` або catalog seed ще не застосований.

### TypeScript не бачить нові shared types

```bash
npm run build --workspace=packages/shared
```

Після Prisma schema changes:

```bash
npm run prisma:generate --workspace=packages/backend
```

### Production API повертає 404

Перевір:

- backend branch/commit;
- backend restart;
- route prefix `/api`;
- production `VITE_API_URL`;
- committed migrations;
- Room Cosmetics seed.

### Asset виглядає занадто маленьким

- прибери зайві прозорі поля;
- порівняй canvas ratio з таблицею;
- не збільшуй глобальні slot bounds для одного невдалого PNG;
- якщо потрібен виняток, документуй його в `ASSET_BOUNDS_OVERRIDES` у `roomSlots.ts`.

### Asset “стрибає” або стоїть над підлогою

- притисни графіку до нижнього краю PNG;
- перевір `object-position: center bottom`;
- не додавай невидиму padding-зону знизу.

## 19. Безпечні зміни й небезпечні зміни

### Безпечно

- Додати новий ID.
- Додати новий PNG.
- Змінити name або rarity через seed.
- Додати новий default/non-limited asset.
- Змінити shop/chest eligibility для asset без активних економічних обмежень.

### Потребує міграційного плану

- Перейменувати існуючий ID.
- Змінити slot або span asset, який уже встановлений користувачами.
- Змінити allowedPositions так, що existing loadout стане невалідним.
- Зробити колишній default asset non-default без ownership migration.
- Видалити active asset із catalog або filesystem.
- Увімкнути limited mint у Company Shop/chests.
- Увімкнути player marketplace без commission/economy review.

## 20. Checklist для нового asset

- [ ] ID у kebab-case.
- [ ] PNG RGBA із прозорим background.
- [ ] Canvas відповідає рекомендованій категорії.
- [ ] Графіка притиснута до низу canvas, якщо це floor-standing asset.
- [ ] Файл лежить у правильній `public/assets/room` папці.
- [ ] Entry доданий у відповідний `room/assets/*.ts` category-файл.
- [ ] Entry доданий у `DEFAULT_ROOM_COSMETICS`.
- [ ] `assetUrl` збігається з реальним шляхом і не починається з `/`.
- [ ] `slot`, `allowedPositions` і `span` узгоджені.
- [ ] Economy flags явно перевірені.
- [ ] Seed запущений.
- [ ] Shared build виконаний, якщо змінювались shared types.
- [ ] Prisma generate виконаний, якщо змінювалась schema.
- [ ] Room Editor preview перевірений.
- [ ] Save/reload перевірений.
- [ ] Mobile/Telegram viewport перевірений.
- [ ] Frontend production build містить PNG.

Якщо всі пункти виконані, asset готовий до production rollout.
