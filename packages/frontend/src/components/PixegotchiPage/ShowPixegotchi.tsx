import { useEffect, useState } from "react";
import {
  Cooldowns,
  ELEMENT_COLORS,
  HomePageProps,
  ITEM_COLORS,
  RARITY_COLORS,
} from "@pixegotchi/shared";
import {
  Apple,
  Bubbles,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gamepad2,
  Gift,
  Heart,
  Mars,
  Moon,
  MoreHorizontal,
  Pencil,
  Pill,
  Rocket,
  Smile,
  Sparkles,
  Venus,
  Zap,
  Droplets,
} from "lucide-react";
import CompactStat from "@/components/MainPage/stats/CompactStat";
import ActionButton from "@/components/MainPage/actions/ActionButton";
import { Visual } from "../MainPage/room/Visual";
import {
  DEFAULT_ROOM_FLOOR_ID,
  DEFAULT_ROOM_WALL_ID,
  ROOM_FLOORS,
  ROOM_WALLS,
} from "../MainPage/room/roomSurfaces";
import type { RoomFloorId, RoomWallId } from "../MainPage/room/roomSurfaces";
import { buildRoomAssetPlacementsFromLoadout } from "../MainPage/room/roomAssets";
import {
  useRoomCosmeticsInventory,
  useRoomCosmeticsLoadout,
} from "@/services/queries/room-cosmetics.queries";
import { useRoomEditorStore } from "@/store/room-editor.store";
import { RoomEditor } from "../MainPage/room/RoomEditor";

export const ShowPixeGotchi: React.FC<HomePageProps> = ({
  pixegotchi,
  onNavigate,
}) => {
  const [cooldowns] = useState<Cooldowns>({
    feed: false,
    play: false,
    sleep: false,
    clean: false,
    heal: false,
  });
  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false);
  const [isEditorRequested, setIsEditorRequested] = useState(false);
  const [editorLoadError, setEditorLoadError] = useState<string | null>(null);
  const isRoomEditing = useRoomEditorStore((state) => state.isEditing);
  const startRoomEditing = useRoomEditorStore((state) => state.startEditing);
  const loadoutQuery = useRoomCosmeticsLoadout();
  const inventoryQuery = useRoomCosmeticsInventory(isEditorRequested);
  const serverLoadout = loadoutQuery.data?.loadout ?? null;
  const wallId =
    serverLoadout &&
    ROOM_WALLS.some((wall) => wall.id === serverLoadout.environmentId)
      ? (serverLoadout.environmentId as RoomWallId)
      : DEFAULT_ROOM_WALL_ID;
  const floorId =
    serverLoadout?.floorId &&
    ROOM_FLOORS.some((floor) => floor.id === serverLoadout.floorId)
      ? (serverLoadout.floorId as RoomFloorId)
      : DEFAULT_ROOM_FLOOR_ID;

  useEffect(() => {
    if (!isEditorRequested) return;

    if (loadoutQuery.isError || inventoryQuery.isError) {
      setEditorLoadError("ROOM DATA FAILED TO LOAD");
      setIsEditorRequested(false);
      return;
    }

    if (!loadoutQuery.isSuccess || !inventoryQuery.isSuccess) return;

    const loadout = loadoutQuery.data.loadout;
    if (!loadout) {
      setEditorLoadError("ROOM LOADOUT IS NOT AVAILABLE");
      setIsEditorRequested(false);
      return;
    }

    setEditorLoadError(null);
    setIsEditorRequested(false);
    setIsRoomMenuOpen(false);
    startRoomEditing(loadout);
  }, [
    inventoryQuery.isError,
    inventoryQuery.isSuccess,
    isEditorRequested,
    loadoutQuery.data,
    loadoutQuery.isError,
    loadoutQuery.isSuccess,
    startRoomEditing,
  ]);

  const handleOpenEditor = () => {
    setEditorLoadError(null);
    if (loadoutQuery.isError) {
      void loadoutQuery.refetch();
    }
    setIsEditorRequested(true);
  };

  if (!pixegotchi) return null;

  if (isRoomEditing) {
    return <RoomEditor pixegotchi={pixegotchi} />;
  }

  const experienceTarget = 1000;
  const experienceProgress = Math.min(
    100,
    Math.max(0, (pixegotchi.experience * 100) / experienceTarget),
  );
  const statusLabel = pixegotchi.status
    ? String(pixegotchi.status).replace(/_/g, " ")
    : "active";
  const statusKey = statusLabel.toLowerCase();
  const statusToneClass =
    statusKey === "dead"
      ? "text-[var(--status-critical)]"
      : statusKey === "critical"
        ? "text-[var(--status-critical)]"
        : statusKey === "sleeping"
          ? "text-[var(--status-sleeping)]"
          : statusKey === "hungry"
            ? "text-[var(--status-hungry)]"
            : statusKey === "dirty"
              ? "text-[var(--status-dirty)]"
              : statusKey === "sick"
                ? "text-[var(--status-sick)]"
                : "text-[var(--status-happy)]";
  const displayStatus = statusKey === "active" ? "Happy" : statusLabel;
  const roomAssets = serverLoadout
    ? buildRoomAssetPlacementsFromLoadout(serverLoadout.placements)
    : [];

  return (
    <div className="space-y-2 p-2.5">
      <section className="pixel-panel relative h-[clamp(20.75rem,88vw,22.5rem)] overflow-hidden bg-pixel-bg-deep/65 shadow-[0_4px_0_var(--color-pixel-shadow),0_0_0_2px_var(--color-pixel-border),0_0_24px_var(--color-pixel-glow),inset_0_0_0_2px_var(--color-pixel-inset)]">
        <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 bg-linear-to-b from-pixel-bg-deep/90 via-pixel-bg-deep/55 to-transparent p-2 pb-7">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate font-pixel text-[15px] leading-6 text-pixel-ink max-[380px]:text-sm">
                {pixegotchi.name ?? "Unknown"}
              </h2>
              <button
                type="button"
                aria-label="Edit Pixegotchi"
                className="shrink-0 text-pixel-border hover:text-pixel-highlight">
                <Pencil size={16} />
              </button>
            </div>
            <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 font-pixel">
              <span
                className={`pixel-pill px-2 py-1 text-[7px] capitalize leading-3 ${RARITY_COLORS[pixegotchi.rarity]} whitespace-nowrap`}>
                {pixegotchi.rarity}
              </span>
              <span
                className={`pixel-pill px-2 py-1 text-[7px] capitalize leading-3 ${ELEMENT_COLORS[pixegotchi.element]} whitespace-nowrap`}>
                {pixegotchi.element}
              </span>
              <span
                className={`pixel-pill px-2 py-1 text-[7px] leading-3 whitespace-nowrap ${pixegotchi.gender === "male" ? "text-[var(--color-pixel-male)]" : "text-[var(--color-pixel-female)]"}`}>
                <span className="flex items-center gap-1">
                  {pixegotchi.gender === "male" ? (
                    <Mars size={10} />
                  ) : (
                    <Venus size={10} />
                  )}
                  <span>
                    {pixegotchi.gender === "male" ? "Male" : "Female"}
                  </span>
                </span>
              </span>
            </div>
          </div>
          <div className="relative flex shrink-0 gap-1.5">
            <button
              type="button"
              className="pixel-icon-button h-9 min-h-9 w-9 min-w-9 text-pixel-red"
              aria-label="Favorite">
              <Heart size={16} fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={() => setIsRoomMenuOpen((current) => !current)}
              className="pixel-icon-button h-9 min-h-9 w-9 min-w-9 text-pixel-muted"
              aria-label="Room customization"
              aria-expanded={isRoomMenuOpen}>
              <MoreHorizontal size={18} />
            </button>
            {isRoomMenuOpen && (
              <div className="pixel-panel-soft absolute right-0 top-11 z-40 w-40 space-y-1 bg-pixel-bg-deep/95 p-1.5 shadow-[0_4px_0_var(--color-pixel-shadow),0_0_16px_var(--color-pixel-glow)] backdrop-blur-sm">
                {editorLoadError && (
                  <div className="px-2 py-1 font-pixel text-[7px] text-pixel-red">
                    {editorLoadError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleOpenEditor}
                  disabled={isEditorRequested}
                  className="pixel-button min-h-0 w-full px-2 py-2 font-pixel text-[8px] leading-3 text-pixel-highlight">
                  {isEditorRequested ? "LOADING..." : "EDIT ROOM"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full w-full [&_.pixel-room-bg]:h-full">
            <Visual
              pet={pixegotchi}
              status={null}
              centerPet={!isStatsOpen}
              wallId={wallId}
              floorId={floorId}
              assets={roomAssets}
            />
            {!serverLoadout && (
              <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 text-center font-pixel text-[7px] text-pixel-muted">
                {loadoutQuery.isError ? "ROOM OFFLINE" : "ROOM LOADING..."}
              </div>
            )}
          </div>
          {isStatsOpen ? (
            <div className="pixel-panel-soft theme-soft-overlay absolute bottom-2 left-2 top-[5.25rem] z-20 flex w-[45%] flex-col justify-center gap-1 border-pixel-border/70 bg-pixel-bg-deep/82 p-1.5 shadow-[0_3px_0_var(--color-pixel-shadow),0_0_18px_var(--color-pixel-glow),inset_0_0_0_2px_var(--color-pixel-inset-soft)] backdrop-blur-[1px] max-[380px]:w-[46%] max-[380px]:gap-1 max-[380px]:p-1">
              <button
                type="button"
                onClick={() => setIsStatsOpen(false)}
                className="pixel-icon-button absolute left-full top-2 z-10 h-6 min-h-6 w-6 min-w-6 text-pixel-highlight"
                aria-label="Hide stats"
                aria-expanded={isStatsOpen}>
                <ChevronLeft size={14} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 grid grid-cols-[auto_1fr] items-center font-pixel text-[8px] leading-3 max-[380px]:gap-1.5 max-[380px]:text-[7px]">
                  <span className="whitespace-nowrap text-pixel-highlight">
                    Level {pixegotchi.level}
                  </span>
                  <span className="truncate text-[7px] text-end text-pixel-muted">
                    {pixegotchi.experience}/{experienceTarget} EXP
                  </span>
                </div>
                <div className="pixel-progress h-2 w-50 max-w-full">
                  <div
                    className="pixel-progress-fill transition-all duration-500"
                    style={{ width: `${experienceProgress}%` }}
                  />
                </div>
              </div>
              <CompactStat
                icon={Heart}
                label="Health"
                value={Number(pixegotchi.health)}
                bgColor="bg-pixel-red/15"
                strokeColor={`${ITEM_COLORS.medicine}`}
                rarity={pixegotchi.rarity}
                variant="row"
              />
              <CompactStat
                icon={Apple}
                label="Hunger"
                value={Number(pixegotchi.hunger)}
                bgColor="bg-pixel-orange/15"
                strokeColor={`${ITEM_COLORS.food}`}
                rarity={pixegotchi.rarity}
                variant="row"
              />
              <CompactStat
                icon={Droplets}
                label="Cleanliness"
                value={Number(pixegotchi.cleanliness)}
                bgColor="bg-pixel-blue/15"
                strokeColor={`${ITEM_COLORS.cleaning}`}
                rarity={pixegotchi.rarity}
                variant="row"
              />
              <CompactStat
                icon={Smile}
                label="Happiness"
                value={Number(pixegotchi.happiness)}
                bgColor="bg-pixel-pink/15"
                strokeColor={`${ITEM_COLORS.toy}`}
                rarity={pixegotchi.rarity}
                variant="row"
              />
              <CompactStat
                icon={Zap}
                label="Energy"
                value={Number(pixegotchi.energy)}
                bgColor="bg-pixel-yellow/15"
                strokeColor={`${ITEM_COLORS.boost}`}
                rarity={pixegotchi.rarity}
                variant="row"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsStatsOpen(true)}
              className="pixel-icon-button absolute left-2 top-[5.25rem] z-20 h-6 min-h-6 w-6 min-w-6 text-pixel-highlight"
              aria-label="Show stats"
              aria-expanded={isStatsOpen}>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </section>

      <section className="pixel-panel flex justify-end items-center gap-2 bg-pixel-bg-deep/72 p-2">
        <span className="font-pixel text-[8px] whitespace-nowrap text-pixel-muted">
          Status:{" "}
          <span
            className={`${statusToneClass} capitalize drop-shadow-[0_0_8px_currentColor]`}>
            {displayStatus}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onNavigate("data")}
          className="pixel-icon-button hidden h-9 min-h-9 w-9 min-w-9 shrink-0 text-pixel-border min-[390px]:grid"
          aria-label="Pixegotchi details">
          <Smile size={16} />
        </button>
      </section>

      <section className="grid grid-cols-3 gap-2 max-[380px]:gap-1.5">
        <ActionButton
          icon={Apple}
          label="Feed"
          onClick={() => onNavigate("inventory", "food")}
          disabled={false}
          gradient="from-red-500 to-red-700"
        />
        <ActionButton
          icon={Pill}
          label="Heal"
          onClick={() => onNavigate("inventory", "medicine")}
          disabled={false}
          gradient="from-green-500 to-emerald-700"
        />
        <ActionButton
          icon={Bubbles}
          label="Clean"
          onClick={() => onNavigate("inventory", "cleaning")}
          disabled={cooldowns.clean}
          gradient="from-sky-500 to-blue-700"
        />
        <ActionButton
          icon={Gamepad2}
          label="Play"
          onClick={() => onNavigate("inventory", "toy")}
          disabled={false}
          gradient="from-purple-500 to-violet-800"
        />
        <ActionButton
          icon={Rocket}
          label="Boost"
          onClick={() => onNavigate("inventory", "boost")}
          gradient="from-orange-400 to-orange-700"
        />
        <ActionButton
          icon={Moon}
          label="Sleep"
          onClick={() => {}}
          disabled={true}
          gradient="from-indigo-600 to-slate-800"
        />
      </section>

      <section className="grid grid-cols-2 gap-2 max-[380px]:gap-1.5">
        <div className="pixel-panel flex min-h-[5rem] items-center gap-2 bg-pixel-surface-soft/80 p-2.5">
          <span className="pixel-icon-box h-10 w-10 shrink-0 bg-pixel-surface-soft text-pixel-highlight">
            <Gift size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-pixel text-[7px] uppercase leading-3 text-pixel-border min-[430px]:text-[8px]">
              Daily Chest
            </div>
            <div className="mt-1 font-pixel text-[9px] leading-3 text-pixel-muted">
              2 / 10
            </div>
            <div className="pixel-progress mt-2 h-2.5">
              <div className="h-full w-2/10 bg-pixel-highlight shadow-[inset_0_1px_0_var(--color-pixel-inset),0_0_8px_currentColor]" />
            </div>
          </div>
          <button
            type="button"
            className="pixel-icon-button hidden h-7 min-h-7 w-7 min-w-7 text-pixel-border min-[390px]:grid"
            aria-label="Daily chest reward">
            <Gift size={14} />
          </button>
        </div>
        <div className="pixel-panel flex min-h-[5rem] items-center gap-2 bg-pixel-surface-soft/80 p-2.5">
          <span className="pixel-icon-box h-10 w-10 shrink-0 bg-pixel-surface-soft text-pixel-orange">
            <Flame size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-pixel text-[7px] uppercase leading-3 text-pixel-border min-[430px]:text-[8px]">
              Streak
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-pixel text-[9px] leading-3 text-pixel-ink">
              <span>1 day</span>
              <Sparkles size={12} className="shrink-0 text-pixel-highlight" />
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-2 flex-1 rounded-sm border border-pixel-bg-deep shadow-[inset_0_1px_0_var(--color-pixel-inset-soft)] ${
                    index === 0 ? "bg-pixel-orange" : "bg-pixel-surface"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="pixel-icon-button hidden h-7 min-h-7 w-7 min-w-7 text-pixel-muted min-[390px]:grid"
            aria-label="Streak calendar">
            <CalendarDays size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};
