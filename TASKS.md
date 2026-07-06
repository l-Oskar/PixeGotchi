# Project Tasks

Цей файл тримаємо як живий список задач. Закриті задачі відмічаємо через `[x]`, нові додаємо у відповідну секцію.

## Next

- [ ] Add backend route test for stale `lastUpdateAt` on `GET /pixegotchi/current`.
- [ ] Add frontend tests for inventory modal action flow.
- [ ] Review stricter frontend ESLint rules and enable them gradually.

## Backlog

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
