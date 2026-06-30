# Current Pixegotchi Contract

## Summary

Зробити не “activePixegotchi”, а “currentPixegotchi”: один поточний слот користувача, який може мати статус `active`, `critical` або `dead`. `dead` теж лишається current і блокує слот, доки не буде окремої дії revive/reset.

## Key Changes

- Додати в backend явний `User.currentPixegotchiId` з relation на `Pixegotchi`.
- При `hatchEgg()` створений pixegotchi стає `currentPixegotchiId`.
- Замінити `findActive()` для UI/slot-check логіки на `findCurrent()`, який бере pet по `currentPixegotchiId`.
- Для бізнес-перевірок використовувати один helper типу `hasOccupiedPixegotchiSlot(userId)`: true, якщо current має `active | critical | dead`.
- Не додавати `active_dead` як enum-статус. Це не статус pet, а роль: “current + status dead”.

## API / Frontend

- Додати `GET /pixegotchi/current`, який повертає `Pixegotchi | null`.
- Старий `GET /pixegotchi/active` або лишити як alias на `current` на перехідний період, або поступово прибрати після заміни фронту.
- У frontend перейменувати query/store поняття з `activePixegotchi` на `currentPixegotchi`, але не міняти патерн: TanStack Query лишається джерелом, `GameBootstrap` синхронізує Zustand.
- Навігація/головна сторінка показує Home, якщо є current pet незалежно від `active/critical/dead`.
- UI-дії вже дивляться на `pixegotchi.status`: ігри/звичайні item actions блокуються для `critical/dead`, revive може бути дозволений для `dead` або `critical` за правилами item.

## Backend Rules

- `startHatching()` і `hatchEgg()` перевіряють не тільки `status: "active"`, а occupied current slot.
- Vault має працювати тільки для current pet, який не `dead`, і після vault очищати `currentPixegotchiId`.
- Death transition не очищає `currentPixegotchiId`.
- Старі `dead` pet без `currentPixegotchiId` лишаються історією і не підтягуються як актуальні.
- Якщо в даних є `currentPixegotchiId`, але pet не знайдений або належить іншому user, backend повертає `null` і це варто зафіксити як data-integrity case.

## Test Plan

- Backend unit/integration:
  - user with current `active` gets `/current` pet and cannot hatch another egg.
  - user with current `critical` gets `/current` pet and cannot hatch another egg.
  - user with current `dead` gets `/current` pet and cannot hatch another egg.
  - user with old `dead` but no `currentPixegotchiId` gets `/current: null` and may start hatch.
  - hatch sets `currentPixegotchiId`.
  - vault clears `currentPixegotchiId`.
- Frontend:
  - `GameBootstrap` stores current pet for `active/critical/dead`.
  - Main navigation shows Home for current dead pet, not Hatch.
  - mutations update both TanStack cache and Zustand consistently.
- Verification:
  - `npm run build --workspace=packages/backend`
  - `npm run build --workspace=packages/frontend`

## Assumptions

- `dead` current pet blocks the slot until a future explicit revive/reset flow.
- `active_dead` не додаємо в enum, бо це краще моделюється як `currentPixegotchiId + status: "dead"`.
- SPEC-логіку death/revive можна доробляти окремо; цей план вирішує саме актуальний current-slot contract.
