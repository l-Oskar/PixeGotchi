# Home UI Asset Backlog

Reference: `/Users/User/Documents/pixe/new_design/home_page.png`

This file tracks the assets needed to move the Home screen from the current
pixel CSS/lucide placeholder version to a near-identical pixel-art match.

RoomScene and room cosmetics are intentionally deferred. This backlog covers
Home chrome, cards, buttons, and icon replacements only.

## Current Placeholder State

- Layout is implemented with reusable pixel CSS/Tailwind primitives.
- Home pet card uses a temporary room background and current pet sprite.
- Header uses `assets/header/frame.png` for the avatar frame,
  `assets/header/coin.png` for PGC, and the plus sprite from
  `assets/header/FreeUI.png`.
- Header wallet/menu, stats, actions, daily/streak, and bottom nav still use
  lucide icons or simple CSS frames.
- Action routing and Inventory one-shot sort/filter behavior must stay as-is.

## Priority 1 - High Impact Replacements

These assets most affect visual similarity to the reference.

- Header player avatar portrait.
  - Current: `UserRound` lucide placeholder inside `assets/header/frame.png`.
  - Needed: square pixel portrait; current frame can stay unless replaced by a
    closer frame.
- Coin / PGC icon.
  - Current: `assets/header/coin.png`.
  - Needed: verify scale in browser and keep if visually close enough.
- Top-right controls.
  - Current: plus sprite from `assets/header/FreeUI.png` with a pressed-state
    sprite switch to the adjacent right button; wallet/menu remain lucide
    placeholders.
  - Needed: verify plus normal/pressed positions, find or crop a purple
    hamburger/menu button matching the reference. Wallet access must remain
    available unless product scope changes.
- Stat icons.
  - Current: lucide heart/apple/zap/smile/droplets with CSS boxes.
  - Needed: pixel heart, pumpkin/hunger, lightning, smiley, and water drop.
- Home action icons.
  - Current: lucide placeholders.
  - Needed: apple, medkit, bath, gamepad, lightning, moon + Z pixel sprites.

## Priority 2 - Surface / Frame Assets

These make the UI less CSS-like and more like the mockup.

- 9-slice action button frames.
  - Red Feed, green Heal, blue Clean, purple Play, orange Boost, dark Sleep.
  - Include corner highlights and bottom shadow baked into the frame.
- Pixel progress bar frames.
  - Stat bars for red/orange/yellow/pink/blue.
  - EXP bar and Daily Chest bar.
  - Optional left/right caps for exact pixel-art look.
- Pixel panel frame.
  - Main pet card frame.
  - Stats panel frame.
  - EXP/status frame.
  - Daily/Streak frame.
  - Bottom nav frame and active pink tab frame.

## Priority 3 - Secondary Home Icons

- Favorite heart button.
- More/details button.
- Edit pencil icon.
- Rarity chip frame variants.
- Element chip frame variants.
- Gender chip frame variants.
- Daily chest treasure icon.
- Gift reward icon.
- Fire streak icon.
- Calendar icon.
- Active/inactive streak dots.

## Bottom Navigation

- Home icon.
- Items bag icon.
- Games gamepad icon.
- Market shop icon.
- Vault safe icon.
- Active pink tab background.
- Inactive separator/frame pieces.

## Deferred Room Assets

RoomScene / room cosmetics stay out of the current Home polish pass. When this
phase resumes, collect or create layered room assets instead of using the
reference screenshot as one large production background.

- Brick wall / room background.
- Window with curtains.
- Floor planks.
- Rug.
- Wall painting.
- Globe and shelf.
- Optional foreground/decor layers.

## Search / Creation Notes

- Prefer transparent PNG/WebP sprites or small sprite sheets.
- Keep assets pixel-art native or nearest-neighbor scaled; avoid blurred
  vector-to-raster exports.
- Use consistent outline weight and light direction across icon sets.
- Do not mix copyrighted game UI packs unless license is clear for commercial
  use.
- If exact assets cannot be found, create a small internal replacement set for
  Priority 1 first.
