# Project Tasks

Цей файл тримаємо як живий список задач. Закриті задачі відмічаємо через `[x]`, нові додаємо у відповідну секцію.

## Next

- [ ] Finish the typed frontend Room asset flow and prepare the current Room changes for commit.
- [ ] Add an atomic server-side Room reset endpoint and enable `RESET ROOM` for server loadouts.
- [ ] Run the Room Cosmetics integration tests with the test PostgreSQL/Redis stack and current Prisma schema.

## Backlog

- [ ] Run interactive Home QA for Telegram safe areas and Inventory action filters when the local backend is available.
- [ ] Add backend route test for stale `lastUpdateAt` on `GET /pixegotchi/current`.
- [ ] Add frontend tests for inventory modal action flow.
- [ ] Review stricter frontend ESLint rules and enable them gradually.
- [ ] Add more frontend tests around blocked Pixegotchi UI states.
- [ ] Add manual QA checklist for degradation, revive, and item usage flows.
- [ ] Review large frontend bundle warnings and decide if code splitting is needed.

## Done

- [x] Implement shared lazy stat degradation.
- [x] Return computed Pixegotchi stats from backend read endpoints.
- [x] Persist computed stats before item effects on user actions.
- [x] Refactor frontend Pixegotchi action flow to XState UI machine.
- [x] Show frontend stat values as rounded integers without mutating real stats.
- [x] Add frontend tests for Pixegotchi UI machine.
- [x] Build the frontend-only Room customization prototype with typed assets, slots, collisions, and persisted local loadout.
- [x] Define shared Room Cosmetics contracts for catalog assets, ownership, positioned loadout, and API DTOs.
- [x] Add Prisma models and a migration for cosmetic catalog, user ownership, and positioned room loadout.
- [x] Add an idempotent seed for the default Room Cosmetics catalog.
- [x] Add authenticated Room Cosmetics read API for catalog, ownership, and current loadout.
- [x] Add transactional Room Cosmetics equip/unequip API with ownership, position, span, and collision validation.
- [x] Add Room Cosmetics integration scenarios for ownership, positions, collisions, overlap, concurrency, and unequip.
- [x] Add typed frontend Room Cosmetics API methods and TanStack Query read/mutation hooks.
- [x] Connect Room customization controls to the server loadout with a safe Zustand/localStorage fallback.
