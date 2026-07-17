# Project Tasks

Цей файл тримаємо як живий список задач. Закриті задачі відмічаємо через `[x]`, нові додаємо у відповідну секцію.

## Next

## Backlog

- [ ] Run interactive Home QA for Telegram safe areas and Inventory action filters when the local backend is available.
- [ ] Add more frontend tests around blocked Pixegotchi UI states.
- [ ] Add manual QA checklist for degradation, revive, and item usage flows.
- [ ] Review large frontend bundle warnings and decide if code splitting is needed.
- [ ] Design one shared Marketplace commission model for all purchase types before enabling player-to-player Room Cosmetics sales.

## Done

- [x] Implement shared lazy stat degradation.
- [x] Return computed Pixegotchi stats from backend read endpoints.
- [x] Persist computed stats before item effects on user actions.
- [x] Refactor frontend Pixegotchi action flow to XState UI machine.
- [x] Show frontend stat values as rounded integers without mutating real stats.
- [x] Add frontend tests for Pixegotchi UI machine.
- [x] Add backend route test for stale `lastUpdateAt` on `GET /pixegotchi/current`.
- [x] Add frontend tests for inventory modal action flow.
- [x] Enable React Hooks ESLint rules and fix the initial dependency violations.

### Room Cosmetics

- [x] Run the Room Cosmetics integration tests with the test PostgreSQL/Redis stack and current Prisma schema.
- [x] Build the responsive full-width RoomScene with separate wall and floor surfaces and bounded side walls.
- [x] Add the collapsible stats panel and recenter the pet while stats are hidden.
- [x] Define the final room position model: wall items `1/3`, floor furniture `2/4`, window `6`, curtains `7`, sofa `8`, rug `9`, and decor `10/11`.
- [x] Support double-height assets in `1+2` and `3+4`, including automatic replacement of all conflicting placements.
- [x] Keep window and curtains as separate slots and render curtains above the window.
- [x] Define shared Room Cosmetics contracts for catalog assets, ownership, positioned loadout, shop, and API DTOs.
- [x] Add Prisma models and migrations for the cosmetic catalog, ownership, positioned room loadout, shop fields, chest rewards, and marketplace listings.
- [x] Add an idempotent Room Cosmetics seed and run it automatically with migration-enabled deploys.
- [x] Add authenticated catalog, ownership, inventory, shop, and loadout APIs.
- [x] Add atomic full-loadout saving with ownership, position, span, collision, and transaction rollback validation.
- [x] Make the server loadout the persisted source of truth and update TanStack Query caches after a successful save.
- [x] Replace the temporary Room controls with a fullscreen editor that hides app chrome, stats, and Home actions.
- [x] Add a local editor draft with `Cancel / Save`, dirty-exit confirmation, local pet visibility, and draft preservation after server errors.
- [x] Add the always-open Room Inventory with owned/default assets, category dropdown, previews, rarity, green Equipped state, and independent scrolling.
- [x] Add the always-visible clickable slot grid and filter inventory assets by the selected position.
- [x] Add move, replace, and remove interactions for single-slot and double-height assets.
- [x] Add separate wall and floor selection inside the editor.
- [x] Add Room Cosmetics backend validation, seed, editor draft, store, slot, and query-cache test coverage.
- [x] Add a first-party PGC Room Cosmetics shop flow with one prepared purchasable asset.
- [x] Add Room Cosmetics as possible chest rewards and display them in the reward modal.
- [x] Implement the player marketplace listing foundation, then disable it on frontend and backend behind feature flags until the shared commission model is ready.
- [x] Split Room assets into category files and reorganize `components/MainPage` into feature folders with updated imports.
- [x] Expand the Room asset catalog and document asset creation, sizing, registration, seeding, build, deploy, and troubleshooting in `docs/room-cosmetics.md`.
- [x] Verify the responsive Room editor and safe-area behavior on a real Telegram device.
- [x] Add Telegram and CSS safe-area handling to the application error fallback.
