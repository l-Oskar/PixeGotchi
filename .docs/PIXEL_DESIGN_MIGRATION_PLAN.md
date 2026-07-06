# Pixel Design Migration Plan

Цей план описує контрольований перехід PixeGotchi на новий pixel-art дизайн із референсів:

- `/Users/User/Documents/pixe/new_design/home_page.png`
- `/Users/User/Documents/pixe/new_design/items_page.png`
- `/Users/User/Documents/pixe/new_design/vault_page.png`

Працюємо маленькими кроками. Перед кожною фазою або ризиковою зміною потрібне підтвердження.

## Guiding Rules

- Не міняти backend/API/data flow під час першого UI rollout.
- TanStack Query лишається джерелом правди для server state.
- Zustand лишається для runtime/UI state, як зараз.
- Home redesign робимо першим, Items/Vault не чіпаємо до стабільного Home.
- Кожен code step завершується `npm run build --workspace=packages/frontend`.
- Якщо змінюємо behavior, а не тільки UI, зупиняємось і узгоджуємо окремо.

## Phase 0 - Preparation

- [x] Перевірити `git status --short` перед будь-якими code edits.
- [x] Зафіксувати поточні touched/untracked файли, щоб не зачепити чужі зміни.
- [x] Відкрити й переглянути поточні компоненти:
  - `packages/frontend/src/pages/MainPage/MainPage.tsx`
  - `packages/frontend/src/components/PixegotchiPage/ShowPixegotchi.tsx`
  - `packages/frontend/src/components/MainPage/Header.tsx`
  - `packages/frontend/src/components/MainPage/Navigation.tsx`
  - `packages/frontend/src/components/MainPage/Visual.tsx`
- [x] Перевірити, що action buttons зараз ведуть у правильні Inventory filters.
- [x] Перевірити, що Games fullscreen досі ховає header/nav.

## Phase 1 - Design Foundation

- [x] Додати локальний pixel font asset або прибрати runtime-залежність від Google Fonts.
- [x] Додати CSS utilities для pixel rendering:
  - `image-rendering: pixelated`
  - pixel panel borders/shadows
  - reusable progress bar styling
  - stable fixed-size icon/action button boxes
- [x] Додати базову color/token структуру для нового темного pixel UI.
- [x] Перевірити, що токени не ламають старі сторінки.
- [x] Запустити frontend build.

## Phase 2 - Room Scene Assets

- [ ] Створити папку `packages/frontend/public/ui/rooms/default/`.
- [ ] Підготувати default room scene assets:
  - background/wall
  - floor
  - window/curtains
  - rug
  - furniture/decor
- [ ] Створити структуру, сумісну з майбутніми Room Cosmetics slots:
  - environment
  - floor
  - rug
  - wallArt
  - furniture
  - decor
  - pet
- [ ] Не використовувати screenshot як один великий фон для production Home.
- [x] Перевірити, що тимчасовий background не розмиває pet sprite.

Status: deferred. У першому rollout свідомо не робили room assets/cosmetics. Поставлено тимчасовий `packages/frontend/public/pixel-room-bg.png`.

## Phase 3 - RoomScene Component

- [x] Створити `RoomScene` компонент для layered scene.
- [x] Підключити поточного Pixegotchi через існуючий `getImage(pixegotchi)`.
- [x] Зберегти tap/heart animation або замінити на pixel-friendly version.
- [x] Додати responsive constraints, щоб scene не розвалювалась на 360/390/430 px.
- [x] Не додавати backend loadout API в цій фазі.
- [x] Запустити frontend build.

Status: partial. `Visual` оновлено під reusable `RoomScene` з тимчасовим pixel room background. Layered room assets/cosmetics лишаються на наступний room-cosmetics етап.

Implemented room slots in frontend-only `RoomScene`:
- `environment`
- `wallArt`
- `floor`
- `rug`
- `furniture`
- `decor`

Not implemented yet:
- room asset files under `packages/frontend/public/ui/rooms/default/`
- user room loadout state
- backend/API schema for room cosmetics

## Phase 4 - Pixel Home Layout

- [x] Переробити `ShowPixeGotchi` під новий Home:
  - pet name + edit icon
  - rarity/element/gender chips
  - stats panel
  - room scene
  - level/EXP/status panel
  - 6 action buttons
  - daily chest/streak blocks
- [x] Зберегти існуючі action routes:
  - Feed -> Inventory `food`
  - Heal -> Inventory `medicine`
  - Clean -> Inventory `cleaning`
  - Play -> Inventory `toy`
  - Boost -> Inventory `boost`
  - Sleep -> disabled/placeholder, поки feature не готова
- [x] Daily chest/streak показати як placeholder, якщо немає готового API/state.
- [x] Перевірити Home з реальним `currentPixegotchi`.
- [x] Запустити frontend build.

## Phase 5 - Pixel Header

- [x] Переробити `Header` під top bar з референсу:
  - avatar/crown slot
  - username
  - PGC balance
  - plus button placeholder
  - menu/wallet button
- [x] Зберегти Telegram safe area logic.
- [x] Зберегти TON connect route або поточний wallet action.
- [x] Перевірити, що header не перекриває Home content.
- [x] Запустити frontend build.

## Phase 6 - Pixel Bottom Navigation

- [x] Переробити `Navigation` під bottom nav з референсу:
  - Home/Hatch/Egg dynamic first tab
  - Items
  - Games
  - Market
  - Vault
- [x] Зберегти `isHidden` behavior для active games.
- [x] Зберегти current active page highlighting.
- [x] Перевірити bottom safe area і content padding.
- [x] Запустити frontend build.

## Phase 7 - Regression Pass

- [x] Перевірити стан без pet і без egg: Start page.
- [x] Перевірити стан з egg: Egg page.
- [x] Перевірити стан з current Pixegotchi: Home page.
- [x] Перевірити Inventory open from every action button.
- [x] Перевірити Games page і fullscreen game chrome hiding.
- [x] Перевірити Vault і Market navigation.
- [x] Перевірити mobile widths: 360, 390, 430 px.
- [x] Перевірити, що текст не вилазить з кнопок/панелей.

Notes:
- Browser QA пройдено на реальному localhost для Home, Items, Games, Market, Vault і Data page.
- Знайдений і виправлений mobile layout issue у Games cards.
- React Query Devtools вимкнені за замовчуванням і доступні через `VITE_ENABLE_QUERY_DEVTOOLS=1`.
- QuickInfo свідомо не чіпали в першому rollout, але оновили в secondary screens rollout.

## Phase 8 - Later Screens

- [x] Після стабільного Home окремо спланувати й виконати Items redesign за `items_page.png`.
- [x] Після стабільного Items окремо спланувати й виконати Vault redesign за `vault_page.png`.
- [x] Не змішувати Items/Vault redesign з Home rollout, якщо не буде окремого підтвердження.
- [x] Оновити Market shell у pixel UI без зміни marketplace mutation flow.
- [x] Оновити QuickInfo у pixel UI.
- [x] Оновити Start/Egg screens у pixel UI без зміни hatching/tap flow.
- [ ] Окремо спланувати room cosmetics assets.

Current status:
- Items redesign done.
- Vault redesign done.
- Market pixel shell done.
- QuickInfo pixel UI done.
- Start/Egg pixel UI done.
- RoomScene / room cosmetics deferred for later.

Secondary screens rollout commits include:
- `ad643b5 InventoryPage`
- `62a7c2d Polish pixel inventory`
- `d0eb924 Polish pixel secondary screens`

Secondary screens verification:
- `npm run build --workspace=packages/frontend`

## Done Criteria For First Rollout

- [x] Home виглядає близько до референсу, але responsive.
- [x] Header і bottom nav у pixel style.
- [x] Немає backend API/schema змін.
- [x] Action buttons працюють як до редизайну.
- [x] Frontend build проходить.
- [x] Є список наступних окремих задач для Items/Vault/Room Cosmetics.

First rollout commit: `ac91fb1 Pixel design rollout`.

Verification completed:
- `npm run build --workspace=packages/frontend`
- `npm run typecheck --workspace=packages/backend`
- `npm run build --workspace=packages/backend`
