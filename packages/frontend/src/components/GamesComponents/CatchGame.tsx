import React, { useState, useRef, useEffect, useCallback } from "react";
import { useMachine } from "@xstate/react";
import { gameMachine } from "../../machines/game.machine";
import { useDrag } from "@use-gesture/react";
import { usePixelMask } from "../../hooks/usePixelMask";
import { useTelegramSwipes } from "@/hooks/useTelegramSwipes";
import { Pixegotchi } from "@pixegotchi/shared";
import { getImage } from "@/utils/getImage";

const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 100;
const OBJECT_SIZE = 30;
const FALL_SPEED = 2.5;
const FRUIT_EMOJIS = ["🍎", "🍌", "🍒", "🍊"];
const BOMB_EMOJI = "💣";
const PIXEL_CHECK_STEP = 3;
const GAME_DURATION = 30;

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: "fruit" | "bomb";
  emoji: string;
  isExploding?: boolean;
  explodeStartTime?: number;
}

export interface CatchGameProps {
  onGameEnd?: (score: number) => void;
  endGame: (n: null) => void;
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

  // --- Весь ігровий стан у refs — жодних ре-рендерів під час гри ---
  const objectsRef = useRef<GameObject[]>([]);
  const basketXRef = useRef(0);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const isPlayingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const canvasWidthRef = useRef(0);
  const canvasHeightRef = useRef(0);

  // React state тільки для UI поза canvas
  const [displayScore, setDisplayScore] = useState(0);
  const [displayTime, setDisplayTime] = useState(GAME_DURATION);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const { maskRef, buildMask, checkPixel } = usePixelMask();
  const [state, send] = useMachine(gameMachine);
  const isGameOver = state.matches("gameOver");
  const shouldDisableSwipes = state.matches("playing");

  useTelegramSwipes(shouldDisableSwipes);

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
        const width = Math.min(container.clientWidth, 500);
        canvas.width = width;
        canvas.height = width * 1.5;
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
            scoreDelta += 1;
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
    ctx.fillStyle = "#1a1a2e";
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
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(bktX, basketTop, BASKET_WIDTH, BASKET_HEIGHT);
    }

    if (isPlayingRef.current) {
      rafRef.current = requestAnimationFrame(gameLoop);
    }
  }, [checkPixelCollision]);

  // Спавн об'єктів — теж без React state
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
      const newX = basketXRef.current + dx * 1.5;
      basketXRef.current = Math.min(
        canvasWidthRef.current - BASKET_WIDTH,
        Math.max(0, newX),
      );
    },
    { pointer: { touch: true }, preventDefault: true },
  );

  useEffect(() => {
    if (!state.matches("playing")) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [state]);

  const startGame = useCallback(() => {
    objectsRef.current = [];
    scoreRef.current = 0;
    timeLeftRef.current = GAME_DURATION;
    setDisplayScore(0);
    setDisplayTime(GAME_DURATION);
    setFinalScore(null);
    basketXRef.current = canvasWidthRef.current / 2 - BASKET_WIDTH / 2;
    isPlayingRef.current = true;
    send({ type: "START" });
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [send, gameLoop]);

  // Cleanup
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div className="relative flex flex-col justify-center bg-black/40 rounded-xl overflow-hidden">
      <button
        onClick={() => endGame(null)}
        className="absolute top-2 left-2 z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white cursor-pointer">
        ← Exit
      </button>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white">
        🍎 Score: {displayScore}
      </div>
      <div className="absolute top-2 right-2 z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white">
        ⏱️ {isGameOver ? 0 : displayTime}s
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none cursor-pointer"
        style={{ touchAction: "none" }}
        {...bind()}
      />

      {state.matches("idle") && (
        <button
          onClick={startGame}
          className="absolute inset-0 m-auto w-40 h-12 bg-green-600 rounded-lg text-white font-bold shadow-lg hover:bg-green-700 transition">
          Start Game
        </button>
      )}

      {state.matches("gameOver") && (
        <div className="absolute inset-0 m-auto w-70 h-45 items-center flex flex-col rounded-lg bg-gray-900 text-white font-pixel m-4 p-4">
          <h2 className="text-2xl mb-4">Game Over</h2>
          <p className="text-xl mb-4">
            Your score: {finalScore ?? displayScore}
          </p>
          <button
            onClick={() => {
              onGameEnd?.(finalScore ?? displayScore);
              send({ type: "RESET" });
            }}
            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">
            Back to Games
          </button>
        </div>
      )}
    </div>
  );
};
