import React, { useState, useRef, useEffect, useCallback } from "react";
import { useMachine } from "@xstate/react";
import { gameMachine } from "../../machines/game.machine";
import { useDrag } from "@use-gesture/react";
import { usePixelMask } from "../../hooks/usePixelMask";
import { useTelegramSwipes } from "@/hooks/useTelegramSwipes";
import { getTraitModifier, Pixegotchi } from "@pixegotchi/shared";
import { getImage } from "@/utils/getImage";
import { GameShell } from "./GameShell";
import {
  useCompleteGameSession,
  useStartGameSession,
} from "@/services/queries/game.queries";

const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 100;
const OBJECT_SIZE = 30;
const FALL_SPEED = 2.5;
const FRUIT_EMOJIS = ["🍎", "🍌", "🍒", "🍊"];
const BOMB_EMOJI = "💣";
const SPECIAL_FRUIT_EMOJI = "🫐";
const SPECIAL_FRUIT_SCORE = 50;
const SPECIAL_FRUIT_SPAWN_TIME = Math.round(Math.random() * 10 + 10); // Секунда, коли з'явиться спеціальний фрукт
const PIXEL_CHECK_STEP = 3;
const GAME_DURATION = 30;
const SCALE = 2;
const FALLBACK_CANVAS_BACKGROUND = "#10091f";
const FALLBACK_BASKET_COLOR = "#8b5a3c";

const getDroppedChestType = (itemsDropped: unknown) => {
  if (!itemsDropped || typeof itemsDropped !== "object") return null;
  const chestType = (itemsDropped as Record<string, unknown>).chestType;
  return typeof chestType === "string" ? chestType : null;
};

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: "fruit" | "bomb";
  emoji: string;
  isExploding?: boolean;
  explodeStartTime?: number;
  isSpecial?: boolean; // Додаємо флаг для спеціального фрукта
}

export interface CatchGameProps {
  onGameEnd?: (score: number) => void;
  endGame: () => void;
  pixegotchi: Pixegotchi;
}

export const CatchGame: React.FC<CatchGameProps> = ({
  onGameEnd,
  endGame,
  pixegotchi,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const basketImageRef = useRef<HTMLImageElement | null>(null);
  const basketLoadedRef = useRef(false);
  const startGameSession = useStartGameSession();
  const completeGameSession = useCompleteGameSession();
  const sessionIdRef = useRef<number | null>(null);
  const completionStartedRef = useRef(false);

  // --- Весь ігровий стан у refs — жодних ре-рендерів під час гри ---
  const objectsRef = useRef<GameObject[]>([]);
  const basketXRef = useRef(0);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const isPlayingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const canvasWidthRef = useRef(0);
  const canvasHeightRef = useRef(0);
  const specialFruitSpawnedRef = useRef(false); // Чи вже випав спеціальний фрукт

  // React state тільки для UI поза canvas
  const [displayScore, setDisplayScore] = useState(0);
  const [displayTime, setDisplayTime] = useState(GAME_DURATION);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const { maskRef, buildMask, checkPixel } = usePixelMask();
  const [state, send] = useMachine(gameMachine);
  const isGameOver = state.matches("gameOver");
  const shouldDisableSwipes = state.matches("playing");
  const pgcTraitModifier = getTraitModifier(
    pixegotchi.traits,
    "game_pgc_gain",
  );
  const expTraitModifier = getTraitModifier(
    pixegotchi.traits,
    "game_exp_gain",
  );
  const chestTraitModifier = getTraitModifier(
    pixegotchi.traits,
    "game_chest_chance",
  );

  useTelegramSwipes(shouldDisableSwipes);

  useEffect(() => {
    if (
      finalScore === null ||
      sessionIdRef.current === null ||
      completionStartedRef.current
    ) {
      return;
    }

    completionStartedRef.current = true;
    completeGameSession.mutate({
      sessionId: sessionIdRef.current,
      score: finalScore,
    });
  }, [completeGameSession, finalScore]);

  const getThemeColor = useCallback(
    (variableName: string, fallback: string) => {
      if (typeof document === "undefined") {
        return fallback;
      }

      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();

      return value || fallback;
    },
    [],
  );

  // Завантаження спрайту
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = getImage(pixegotchi);
    img.onload = () => {
      basketImageRef.current = img;
      basketLoadedRef.current = true;
      buildMask(img).catch(console.error);
    };
  }, [buildMask, pixegotchi]);

  // Розміри canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        canvasWidthRef.current = canvas.width;
        canvasHeightRef.current = canvas.height;
        basketXRef.current = canvas.width / 2 - BASKET_WIDTH / 2;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Pixel-perfect перевірка колізії
  const checkPixelCollision = useCallback(
    (objX: number, objY: number, bktX: number, bktY: number): boolean => {
      const mask = maskRef.current;
      if (!mask) {
        return (
          objX + OBJECT_SIZE > bktX &&
          objX < bktX + BASKET_WIDTH &&
          objY + OBJECT_SIZE > bktY &&
          objY < bktY + BASKET_HEIGHT
        );
      }
      const checkStartY = Math.floor(OBJECT_SIZE / 2);
      for (let dy = checkStartY; dy < OBJECT_SIZE; dy += PIXEL_CHECK_STEP) {
        for (let dx = 0; dx < OBJECT_SIZE; dx += PIXEL_CHECK_STEP) {
          const worldX = objX + dx;
          const worldY = objY + dy;
          if (
            worldX < bktX ||
            worldX >= bktX + BASKET_WIDTH ||
            worldY < bktY ||
            worldY >= bktY + BASKET_HEIGHT
          )
            continue;
          const maskX = Math.floor(
            ((worldX - bktX) / BASKET_WIDTH) * mask.width,
          );
          const maskY = Math.floor(
            ((worldY - bktY) / BASKET_HEIGHT) * mask.height,
          );
          if (checkPixel(maskX, maskY)) return true;
        }
      }
      return false;
    },
    [maskRef, checkPixel],
  );

  // Головний game loop — чистий rAF, без React
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvasWidthRef.current;
    const H = canvasHeightRef.current;
    const bktX = basketXRef.current;
    const basketTop = H - BASKET_HEIGHT;
    const now = performance.now();

    // --- Update ---
    const objs = objectsRef.current;
    const toRemove = new Set<number>();
    let scoreDelta = 0;

    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i];

      if (obj.isExploding) {
        if (now - (obj.explodeStartTime || 0) >= 500) toRemove.add(obj.id);
        continue;
      }

      obj.y += FALL_SPEED;

      if (
        obj.y + OBJECT_SIZE >= basketTop &&
        obj.y <= H &&
        obj.x + OBJECT_SIZE > bktX &&
        obj.x < bktX + BASKET_WIDTH
      ) {
        if (checkPixelCollision(obj.x, obj.y, bktX, basketTop)) {
          if (obj.type === "fruit") {
            // Перевіряємо, чи це спеціальний фрукт
            if (obj.isSpecial) {
              scoreDelta += SPECIAL_FRUIT_SCORE; // 50 очок
            } else {
              scoreDelta += 1;
            }
            toRemove.add(obj.id);
          } else {
            scoreDelta -= 10;
            obj.isExploding = true;
            obj.emoji = "💥";
            obj.explodeStartTime = now;
          }
          continue;
        }
      }

      if (obj.y > H) toRemove.add(obj.id);
    }

    if (toRemove.size > 0) {
      objectsRef.current = objs.filter((o) => !toRemove.has(o.id));
    }
    if (scoreDelta !== 0) {
      scoreRef.current = Math.max(0, scoreRef.current + scoreDelta);
      // Оновлюємо UI score не частіше ніж потрібно
      setDisplayScore(scoreRef.current);
    }

    // --- Draw ---
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = getThemeColor(
      "--color-pixel-bg-deep",
      FALLBACK_CANVAS_BACKGROUND,
    );
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${OBJECT_SIZE}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const obj of objectsRef.current) {
      if (obj.isExploding) {
        ctx.fillStyle = "transparent";
        ctx.beginPath();
        ctx.arc(
          obj.x + OBJECT_SIZE / 2,
          obj.y + OBJECT_SIZE / 2,
          OBJECT_SIZE / 1.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "white";
      ctx.fillText(obj.emoji, obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2);
    }

    if (basketLoadedRef.current && basketImageRef.current) {
      ctx.drawImage(
        basketImageRef.current,
        bktX,
        basketTop,
        BASKET_WIDTH,
        BASKET_HEIGHT,
      );
    } else {
      ctx.fillStyle = getThemeColor(
        "--color-pixel-orange",
        FALLBACK_BASKET_COLOR,
      );
      ctx.fillRect(bktX, basketTop, BASKET_WIDTH, BASKET_HEIGHT);
    }

    if (isPlayingRef.current) {
      rafRef.current = requestAnimationFrame(gameLoop);
    }
  }, [checkPixelCollision, getThemeColor]);

  // Спавн звичайних об'єктів
  useEffect(() => {
    if (!state.matches("playing")) return;
    const interval = setInterval(() => {
      if (!isPlayingRef.current) return;
      if (Math.random() >= 0.4) return;
      const isBomb = Math.random() < 0.25;
      objectsRef.current.push({
        id: Date.now() + Math.random(),
        x: Math.random() * (canvasWidthRef.current - OBJECT_SIZE),
        y: 0,
        type: isBomb ? "bomb" : "fruit",
        emoji: isBomb
          ? BOMB_EMOJI
          : FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)],
      });
    }, 100);
    return () => clearInterval(interval);
  }, [state]);

  // Спавн спеціального фрукта 🫐
  useEffect(() => {
    if (!state.matches("playing")) return;

    const specialCheckInterval = setInterval(() => {
      if (!isPlayingRef.current) return;

      // Перевіряємо, чи настав час для спеціального фрукта і чи він ще не випав
      const timeLeft = timeLeftRef.current;
      if (
        timeLeft === SPECIAL_FRUIT_SPAWN_TIME &&
        !specialFruitSpawnedRef.current
      ) {
        // Спавнимо спеціальний фрукт
        objectsRef.current.push({
          id: Date.now() + Math.random(),
          x: Math.random() * (canvasWidthRef.current - OBJECT_SIZE),
          y: 0,
          type: "fruit",
          emoji: SPECIAL_FRUIT_EMOJI,
          isSpecial: true, // Позначаємо як спеціальний
        });
        specialFruitSpawnedRef.current = true;
        console.log("🫐 Special fruit spawned!"); // Для дебагу
      }
    }, 100); // Перевіряємо кожні 100ms

    return () => clearInterval(specialCheckInterval);
  }, [state]);

  // Таймер — оновлює тільки UI, не game loop
  useEffect(() => {
    if (!state.matches("playing")) return;
    const timer = setInterval(() => {
      timeLeftRef.current -= 1;
      setDisplayTime(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timer);
        isPlayingRef.current = false;
        cancelAnimationFrame(rafRef.current);
        setFinalScore(scoreRef.current);
        send({ type: "GAME_OVER" });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [state, send]);

  // Свайп / drag
  const bind = useDrag(
    ({ delta: [dx], event }) => {
      event.preventDefault();
      if (!isPlayingRef.current) return;
      const newX = basketXRef.current + dx * SCALE;
      basketXRef.current = Math.min(
        canvasWidthRef.current - BASKET_WIDTH,
        Math.max(0, newX),
      );
    },
    { pointer: { touch: true }, preventDefault: true },
  );

  const startGame = useCallback(async () => {
    setStartError(null);

    try {
      const session = await startGameSession.mutateAsync({
        pixegotchiId: pixegotchi.id,
        gameId: "catch_fruits",
      });
      sessionIdRef.current = session.id;
      completionStartedRef.current = false;
      objectsRef.current = [];
      scoreRef.current = 0;
      timeLeftRef.current = GAME_DURATION;
      setDisplayScore(0);
      setDisplayTime(GAME_DURATION);
      setFinalScore(null);
      completeGameSession.reset();
      basketXRef.current = canvasWidthRef.current / 2 - BASKET_WIDTH / 2;
      isPlayingRef.current = true;
      specialFruitSpawnedRef.current = false;
      send({ type: "START" });
      rafRef.current = requestAnimationFrame(gameLoop);
    } catch {
      setStartError("Could not start the game. Check your energy and try again.");
    }
  }, [completeGameSession, gameLoop, pixegotchi.id, send, startGameSession]);

  const finishGame = async () => {
    const score = finalScore ?? displayScore;

    if (
      !completeGameSession.isSuccess &&
      sessionIdRef.current !== null
    ) {
      try {
        await completeGameSession.mutateAsync({
          sessionId: sessionIdRef.current,
          score,
        });
      } catch {
        return;
      }
    }

    onGameEnd?.(score);
    send({ type: "RESET" });
  };

  const exitGame = async () => {
    isPlayingRef.current = false;
    cancelAnimationFrame(rafRef.current);

    if (
      sessionIdRef.current !== null &&
      !completionStartedRef.current &&
      !completeGameSession.isSuccess
    ) {
      completionStartedRef.current = true;
      try {
        await completeGameSession.mutateAsync({
          sessionId: sessionIdRef.current,
          score: 0,
        });
      } catch {
        // Energy remains spent even if the abandonment request cannot be saved.
      }
    }

    endGame();
  };

  // Cleanup
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <GameShell
      title="Catch Fruits"
      score={`Score: ${displayScore}`}
      timer={`${isGameOver ? 0 : displayTime}s`}
      onExit={exitGame}>
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-pointer"
        style={{ touchAction: "none" }}
        {...bind()}
      />

      {state.matches("idle") && (
        <button
          onClick={startGame}
          disabled={startGameSession.isPending}
          className="pixel-button absolute inset-0 m-auto h-12 w-40 bg-pixel-green font-pixel text-[9px] leading-4 text-pixel-accent-ink transition hover:scale-105">
          {startGameSession.isPending ? "Starting..." : "Start Game"}
        </button>
      )}

      {state.matches("idle") && startError && (
        <p className="absolute inset-x-4 top-[calc(50%+3.75rem)] mx-auto max-w-xs text-center font-pixel text-[8px] leading-4 text-pixel-red">
          {startError}
        </p>
      )}

      {state.matches("gameOver") && (
        <div className="pixel-panel absolute inset-x-4 top-1/2 mx-auto flex max-w-xs -translate-y-1/2 flex-col items-center p-4 text-center font-pixel">
          <h2 className="mb-4 text-sm leading-5 text-pixel-ink">Game Over</h2>
          <p className="theme-readable-muted mb-4 text-[9px] leading-4">
            Your score: {finalScore ?? displayScore}
          </p>
          {completeGameSession.data && (
            <div className="mb-4 grid gap-1 text-[8px] leading-4">
              <span className="text-pixel-green">
                +{completeGameSession.data.pgcEarned} PGC
              </span>
              <span className="text-pixel-green">
                +{completeGameSession.data.experienceGained} EXP
              </span>
              {completeGameSession.data.chestDropped && (
                <span className="text-pixel-highlight">
                  {getDroppedChestType(completeGameSession.data.itemsDropped)
                    ?.replace(/_/g, " ")
                    .toUpperCase() ?? "CHEST"}{" "}
                  found
                </span>
              )}
            </div>
          )}
          <div className="mb-4 flex flex-wrap justify-center gap-2 text-[7px] leading-3 text-pixel-blue">
            {pgcTraitModifier !== 1 && (
              <span>PGC trait +{Math.round((pgcTraitModifier - 1) * 100)}%</span>
            )}
            {expTraitModifier !== 1 && (
              <span>EXP trait +{Math.round((expTraitModifier - 1) * 100)}%</span>
            )}
            {chestTraitModifier !== 1 && (
              <span>
                Chest trait +{Math.round((chestTraitModifier - 1) * 100)}%
              </span>
            )}
          </div>
          <button
            onClick={finishGame}
            disabled={completeGameSession.isPending}
            className="pixel-button bg-pixel-highlight px-6 py-2 text-[8px] leading-4 text-pixel-accent-ink hover:scale-105">
            {completeGameSession.isPending
              ? "Saving..."
              : completeGameSession.isError
                ? "Retry Save"
                : "Back to Games"}
          </button>
          {completeGameSession.isError && (
            <p className="mt-3 text-[7px] leading-4 text-pixel-red">
              Could not save the result.
            </p>
          )}
        </div>
      )}
    </GameShell>
  );
};
