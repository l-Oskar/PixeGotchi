# Room Cosmetics Rollout Plan

Цей план потрібен, щоб поступово перейти від нового Home-дизайну до повноцінної системи збереження, колекціонування та редагування assets для кімнати. Кожен пункт виконуємо окремо після підтвердження.

## Goals

- Home має бути не одним screenshot-фоном, а layered scene зі слотами.
- Room cosmetics мають бути окремою economy feature, не consumable items.
- Server loadout має бути єдиним джерелом збереженої кімнати.
- Edit Room має давати fullscreen preview, inventory owned assets і один атомарний Save.
- Shop, chests і marketplace підключаємо після стабілізації editor та ownership flow.

## Phase 0 - Specification

- [x] Додати `Room Cosmetics & Environments` у `.docs/SPEC.md`.
- [x] Зафіксувати, що cosmetics не змінюють stats у базовій версії.
- [x] Оновити cosmetic slot-модель у shared types і Prisma: environment, floor, window, curtain, rug, wallArt, furniture, decor; позиція `5` залишається scene-only для pet.
- [x] Зафіксувати acquisition sources: shop, chests, events, marketplace.
- [x] Зафіксувати data model: `CosmeticAsset`, `UserCosmetic`, `UserRoomLoadout`.

## Phase 1 - Home Redesign Foundation

- [x] Підготувати pixel UI tokens: фон, панелі, borders, shadows, progress bars.
- [x] Перенести pixel font у локальний asset, без Google Fonts runtime dependency.
- [x] Додати default room assets у `packages/frontend/public/assets/room/`.
- [x] Зробити `RoomScene` компонент зі slot/layer структурою.
- [x] Підключити поточного Pixegotchi sprite як pet layer.
- [x] Зробити адаптивну висоту Room без прив’язки геометрії до screenshot-фону.
- [x] Розділити Room на незалежні повноширинні шари стіни та підлоги.
- [x] Перевірити, що scene нормально масштабується на 360/390/430 px.

## Phase 2 - Pixel Home UI

- [x] Переробити верхній блок `ShowPixeGotchi`: Room займає всю картку, pet header і stats рендеряться поверх scene.
- [x] Додати stats panel з health, hunger, energy, happiness, cleanliness.
- [x] Додати згортання stats panel і компактну кнопку для відкриття.
- [x] Центрувати pet при закритій stats panel.
- [x] Додати level/EXP/status bar.
- [x] Додати великі action buttons: Feed, Heal, Clean, Play, Boost, Sleep.
- [x] Зберегти поточну навігацію action buttons до Inventory filters.
- [x] Додати Daily Chest і Streak блоки як UI placeholders або існуючі дані, якщо вони є.

## Phase 3 - Shared App Shell

- [x] Переробити `Header` під pixel top bar.
- [x] Переробити `Navigation` під pixel bottom nav.
- [x] Зберегти behavior: Games fullscreen ховає header/nav.
- [x] Додати Telegram SDK bottom inset + CSS safe-area fallback для Navigation і main content.
- [x] Перевірити переходи Home, Items, Games, Market, Vault.
- [ ] Перевірити Telegram safe area зверху і знизу на реальному пристрої.

## Phase 4 - Backend Cosmetics Foundation

- [x] Додати shared types для cosmetics.
- [x] Додати Prisma models для cosmetic catalog, ownership і room loadout.
- [x] Додати idempotent seed для базового default room set.
- [x] Додати API для отримання catalog, ownership і current loadout.
- [x] Додати поточні equip/unequip mutations.
- [x] Додати backend validation tests для ownership і slots.
- [x] Додати `PUT /room-cosmetics/loadout` для повного draft.
- [x] Зберігати весь loadout атомарно в одній транзакції.
- [x] Підготувати boolean ownership view для editor: default assets + assets користувача.
- [x] Додати автоматичний idempotent Room Cosmetics seed у production deploy.
- [x] Додати міграцію наявного Window з позиції `7` на позицію `6`.

## Phase 5 - Shop, Chests, Marketplace

- [ ] Додати cosmetics у company shop як PGC sink.
- [ ] Додати cosmetics у chest/event reward pool.
- [ ] Додати marketplace listing type `cosmetic`.
- [ ] Додати комісію marketplace для cosmetic trades.
- [ ] Перевірити, що limited cosmetics не можна нескінченно створювати через shop/chests.

## Phase 6 - Edit Room

- [x] Додати тимчасовий Room customization prototype у меню `...` з ON/OFF керуванням.
- [x] Замінити prototype на дію `... -> Edit Room`.
- [x] Додати fullscreen editor без Header, Navigation, stats і Home actions.
- [x] Завантажувати editor inventory і current loadout перед ініціалізацією editor.
- [x] Додати локальний room draft без API-запитів до Save.
- [x] Додати `Cancel / Save`.
- [x] Додати підтвердження виходу при dirty draft.
- [x] Додати локальну кнопку приховування pet у editor.
- [ ] Додати bottom sheet inventory тільки всередині editor.
- [ ] Додати категорії: All, Walls, Floors, Windows, Curtains, Furniture, Rugs, Wall Art, Decor.
- [ ] Показувати тільки активні default та owned assets.
- [ ] Додати asset cards із preview, rarity та станом Equipped.
- [ ] При виборі asset підсвічувати тільки дозволені позиції.
- [ ] Автоматично замінювати конфліктний asset у draft.
- [ ] Додати Move, Replace і Remove для встановленого asset.
- [ ] Підтримати подвійні вертикальні позиції `1+2` і `3+4`.
- [ ] Додати окремий preview вибору стін і підлоги.
- [x] Зберігати весь draft одним атомарним Save.
- [x] Оновлювати TanStack Query cache після успішного Save.
- [x] Залишати editor і draft відкритими після server error.
- [ ] Прибрати старий persisted frontend fallback після стабілізації server loadout.

## Frontend Room Prototype - Completed

- [x] Додати typed-каталог стін і підлоги з незалежним перемиканням.
- [x] Додати typed-каталог room assets: window, curtains, cabinet, sofa, rug, wall art і decor.
- [x] Нарізати перші RGBA assets зі sprite sheets і підключити через `import.meta.env.BASE_URL`.
- [x] Додати позиції `1-11`, де `5` зарезервована під pet.
- [x] Додати підтримку подвійних вертикальних пар `1+2` і `3+4`.
- [x] Додати collision resolution: перший asset займає слот, конфліктні placements відсіюються.
- [x] Синхронізувати дзеркальну геометрію `1 <-> 3` та `2 <-> 4`.
- [x] Додати режим `Edit slots` з контурами й номерами позицій.
- [x] Додати тимчасове ON/OFF керування room assets.
- [x] Додати переміщення cabinet між `1+2` та `3+4`.
- [x] Додати `RESET ROOM` до default frontend loadout.
- [x] Зберігати prototype room loadout у Zustand/localStorage.
- [x] Додати focused tests для slot occupancy, collisions і mirrored geometry.
- [x] Додати взаємовиключні cosmetic variants для sofa і rug.
- [x] Перевести Window з позиції `7` на позицію `6`.
- [x] Залишити Curtains на позиції `7` і прибрати штучний overlap із Window.
- [x] Рендерити Curtains на вищому layer поверх Window.
- [x] Синхронно оновити frontend catalog, backend seed, defaults і validation.
- [x] Мігрувати наявні server loadout з Window `7` на `6`.

## Verification Checklist

- [ ] `npm run build --workspace=packages/frontend`
- [x] Home mobile check: 360 px
- [x] Home mobile check: 390 px
- [x] Home mobile check: 430 px
- [ ] Feed opens Inventory with food filter
- [ ] Heal opens Inventory with medicine filter
- [ ] Clean opens Inventory with cleaning filter
- [ ] Play opens Inventory with toy filter
- [ ] Boost opens Inventory with boost filter
- [x] Bottom nav transitions work
- [x] Games fullscreen hides global chrome
- [x] Room layers do not overlap stats/actions/navigation

## Edit Room Verification

### Backend

- [ ] Default та user-owned assets проходять ownership validation.
- [ ] Неowned і невідомі assets відхиляються без зміни loadout.
- [ ] Allowed positions validation працює для кожного типу asset.
- [ ] Collision validation відхиляє конфліктні placements.
- [ ] Span validation дозволяє тільки `1+2` і `3+4`.
- [ ] Window у позиції `6` і Curtains у позиції `7` зберігаються одночасно.
- [ ] Невдалий Save повністю відкочується транзакцією.
- [ ] Повторний Room Cosmetics seed не створює дублікати.

### Frontend

- [ ] Зміни draft не викликають API до натискання Save.
- [ ] Cancel повністю відкидає draft.
- [ ] Move, Replace і Remove правильно змінюють preview.
- [ ] Pet visibility не потрапляє в server payload.
- [ ] Server error не закриває editor і не очищає draft.
- [ ] Успішний Save оновлює current room cache.

### Viewports

- [ ] Edit Room mobile check: 360 px.
- [ ] Edit Room mobile check: 390 px.
- [ ] Edit Room mobile check: 430 px.
- [ ] Edit Room check на вузькому tablet viewport.
- [ ] Editor враховує Telegram top/bottom safe-area.
- [ ] Bottom sheet має незалежний scroll і не обрізає Room.
- [ ] Fullscreen editor приховує Header, Navigation і звичайний Home UI.

## Current Defaults

- Server loadout є єдиним джерелом збереженої кімнати.
- Editor показує активні default та owned assets.
- Один asset можна встановити лише один раз.
- Room Inventory існує тільки як bottom sheet усередині editor.
- Locked assets, Marketplace, drag-and-drop і Room Inventory у вкладці Items не входять у поточну фазу.
- Pet можна приховати тільки локально на час редагування; цей стан не зберігається на сервері.
- Cosmetics залишаються visual-only і не змінюють stats.
