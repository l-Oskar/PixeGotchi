import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGameStore } from "../../store/game.store";
import { useMachine } from "@xstate/react";
import { gameMachine } from "../../machine/game.machine";
import { useDrag } from "@use-gesture/react";
import { useGameLoop } from "../../hooks/useGameLoop";
import { Pixegotchi } from "@shared";
import { getImage } from "@/utils/getImage";

const BASKET_WIDTH = 100;
const BASKET_HEIGHT = 100;
const OBJECT_SIZE = 30;
const FALL_SPEED = 2.5;
const FRUIT_EMOJIS = ["🍎", "🍌", "🍒", "🍊"];
const BOMB_EMOJI = "💣";

// Поріг яскравості для визначення "видимого" пікселя спрайту
const PIXEL_VISIBILITY_THRESHOLD = 30;
// Крок сітки при перевірці пікселів (менше = точніше, але повільніше)
const PIXEL_CHECK_STEP = 2;

interface PixelMask {
  mask: boolean[][];
  width: number;
  height: number;
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
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const basketImageRef = useRef<HTMLImageElement | null>(null);
  const [basketLoaded, setBasketLoaded] = useState(false);

  // Маска видимих пікселів спрайту (будується один раз при завантаженні)
  const spriteMaskRef = useRef<PixelMask | null>(null);

  const {
    score,
    timeLeft,
    objects,
    basketX,
    canvasWidth,
    canvasHeight,
    addScore,
    setBasketX,
    removeObject,
    clearObjects,
    resetGame,
    setCanvasDimensions,
    setIsPlaying,
  } = useGameStore();

  const [state, send] = useMachine(gameMachine);
  const isPlaying = state.matches("playing");
  const isGameOver = state.matches("gameOver");

  /**
   * Будує boolean-маску видимих пікселів для зображення.
   * Піксель вважається "видимим" якщо хоча б один з каналів R/G/B
   * перевищує PIXEL_VISIBILITY_THRESHOLD (фільтрує чорний фон).
   */
  const buildPixelMask = useCallback((img: HTMLImageElement): PixelMask => {
    const offscreen = document.createElement("canvas");
    offscreen.width = img.naturalWidth;
    offscreen.height = img.naturalHeight;

    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      // Якщо canvas недоступний — повертаємо маску де всі пікселі видимі
      return {
        mask: Array.from({ length: img.naturalHeight }, () =>
          new Array(img.naturalWidth).fill(true),
        ),
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    }

    ctx.drawImage(img, 0, 0);
    const { data, width, height } = ctx.getImageData(
      0,
      0,
      offscreen.width,
      offscreen.height,
    );

    const mask: boolean[][] = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Піксель видимий якщо він не є майже чорним (фон спрайту)
        return (
          r > PIXEL_VISIBILITY_THRESHOLD ||
          g > PIXEL_VISIBILITY_THRESHOLD ||
          b > PIXEL_VISIBILITY_THRESHOLD
        );
      }),
    );

    return { mask, width, height };
  }, []);

  // Завантаження зображення спрайту + побудова pixel-маски
  useEffect(() => {
    const img = new Image();
    // Дозволяємо читати пікселі з canvas (потрібно для getImageData)
    img.crossOrigin = "anonymous";
    img.src = getImage(pixegotchi);
    img.onload = () => {
      basketImageRef.current = img;
      // Будуємо маску один раз — далі використовуємо ref
      spriteMaskRef.current = buildPixelMask(img);
      setBasketLoaded(true);
    };
  }, [buildPixelMask, pixegotchi]);

  // Ініціалізація Canvas та старт гри
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        const width = Math.min(container.clientWidth, 500);
        canvas.width = width;
        canvas.height = width * 1.5;
        setCanvasDimensions(canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [setCanvasDimensions]);

  // Спавн об'єктів (фрукти/бомби)
  const spawnObject = useCallback(() => {
    if (!isPlaying) return;
    const isBomb = Math.random() < 0.25;
    const type = isBomb ? "bomb" : "fruit";
    const emoji = isBomb
      ? BOMB_EMOJI
      : FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)];
    const x = Math.random() * (canvasWidth - OBJECT_SIZE);
    useGameStore.getState().addObject({
      id: Date.now() + Math.random(),
      x,
      y: 0,
      type,
      emoji,
    });
  }, [canvasWidth, isPlaying]);

  // Генерація об'єктів у циклі
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.4) spawnObject();
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, spawnObject]);

  /**
   * Pixel-perfect перевірка колізії між об'єктом та спрайтом кошика.
   *
   * Алгоритм:
   * 1. Перебираємо точки нижньої частини об'єкта з кроком PIXEL_CHECK_STEP
   * 2. Для кожної точки перевіряємо чи вона потрапляє в bounding box кошика
   * 3. Якщо так — маппимо координату на маску спрайту і перевіряємо видимість пікселя
   * 4. Якщо знайшли видимий піксель — є колізія
   *
   * Fallback на звичайний bounding box якщо маска недоступна.
   */
  const checkPixelCollision = useCallback(
    (
      objX: number,
      objY: number,
      objSize: number,
      bktX: number,
      bktY: number,
    ): boolean => {
      const mask = spriteMaskRef.current;

      // Fallback: звичайний bounding box
      if (!mask) {
        return (
          objX + objSize > bktX &&
          objX < bktX + BASKET_WIDTH &&
          objY + objSize > bktY &&
          objY < bktY + BASKET_HEIGHT
        );
      }

      // Перевіряємо лише нижню половину об'єкта (де є контакт)
      const checkStartY = Math.floor(objSize / 2);

      for (let dy = checkStartY; dy < objSize; dy += PIXEL_CHECK_STEP) {
        for (let dx = 0; dx < objSize; dx += PIXEL_CHECK_STEP) {
          const worldX = objX + dx;
          const worldY = objY + dy;

          // Чи потрапляє точка в bounding box кошика?
          if (
            worldX < bktX ||
            worldX >= bktX + BASKET_WIDTH ||
            worldY < bktY ||
            worldY >= bktY + BASKET_HEIGHT
          ) {
            continue;
          }

          // Маппимо позицію у просторі кошика на координати маски спрайту
          const relX = worldX - bktX;
          const relY = worldY - bktY;
          const maskX = Math.floor((relX / BASKET_WIDTH) * mask.width);
          const maskY = Math.floor((relY / BASKET_HEIGHT) * mask.height);

          // Якщо в маску потрапляємо на видимий піксель — це колізія!
          if (mask.mask[maskY]?.[maskX]) {
            return true;
          }
        }
      }

      return false;
    },
    [],
  );

  // Оновлення позицій та колізії (викликається в ігровому циклі)
  const updateObjects = useCallback(() => {
    if (!isPlaying) return;
    const currentObjects = [...useGameStore.getState().objects];
    let scoreDelta = 0;
    const toRemove: number[] = [];
    const now = performance.now();

    const basketTop = canvasHeight - BASKET_HEIGHT;

    for (let i = 0; i < currentObjects.length; i++) {
      const obj = currentObjects[i];

      if (obj.isExploding) {
        if (now - (obj.explodeStartTime || 0) >= 500) {
          toRemove.push(obj.id);
        }
        continue;
      }

      obj.y += FALL_SPEED;

      // Попередня перевірка bounding box — дешева операція перед pixel-check
      const inVerticalRange =
        obj.y + OBJECT_SIZE >= basketTop && obj.y <= canvasHeight;
      const inHorizontalRange =
        obj.x + OBJECT_SIZE > basketX && obj.x < basketX + BASKET_WIDTH;

      if (inVerticalRange && inHorizontalRange) {
        // Точна перевірка по пікселях спрайту
        const hasCollision = checkPixelCollision(
          obj.x,
          obj.y,
          OBJECT_SIZE,
          basketX,
          basketTop,
        );

        if (hasCollision) {
          if (obj.type === "fruit") {
            scoreDelta += 1;
            toRemove.push(obj.id);
          } else {
            scoreDelta -= 10;
            obj.isExploding = true;
            obj.emoji = "💥";
            obj.explodeStartTime = now;
          }
          continue;
        }
      }

      if (obj.y > canvasHeight && !obj.isExploding) {
        toRemove.push(obj.id);
      }
    }

    toRemove.forEach((id) => removeObject(id));
    if (scoreDelta !== 0) addScore(scoreDelta);
  }, [
    isPlaying,
    basketX,
    canvasHeight,
    removeObject,
    addScore,
    checkPixelCollision,
  ]);

  // Використання кастомного хука для ігрового циклу
  useGameLoop(isPlaying, () => {
    updateObjects();
    drawCanvas();
  });

  // Малювання Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    objects.forEach((obj) => {
      ctx.font = `${OBJECT_SIZE}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

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
      } else {
        ctx.fillStyle = "transparent";
        ctx.fillRect(obj.x, obj.y, OBJECT_SIZE, OBJECT_SIZE);
      }

      ctx.fillStyle = "white";
      ctx.fillText(obj.emoji, obj.x + OBJECT_SIZE / 2, obj.y + OBJECT_SIZE / 2);
    });

    if (basketLoaded && basketImageRef.current) {
      ctx.drawImage(
        basketImageRef.current,
        basketX,
        canvasHeight - BASKET_HEIGHT,
        BASKET_WIDTH,
        BASKET_HEIGHT,
      );
    } else {
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(
        basketX,
        canvasHeight - BASKET_HEIGHT,
        BASKET_WIDTH,
        BASKET_HEIGHT,
      );
      ctx.fillStyle = "#D2691E";
      ctx.fillRect(
        basketX + 5,
        canvasHeight - BASKET_HEIGHT - 5,
        BASKET_WIDTH - 10,
        5,
      );
    }
  }, [canvasWidth, canvasHeight, objects, basketX, basketLoaded]);

  // Свайпи через useGesture
  const bind = useDrag(
    ({ delta: [dx], event }) => {
      event.preventDefault();
      if (!isPlaying) return;
      const sensivity = 1.5;
      const newX = basketX + dx * sensivity;
      const maxX = canvasWidth - BASKET_WIDTH;
      setBasketX(Math.min(maxX, Math.max(0, newX)));
    },
    {
      pointer: { touch: true },
      preventDefault: true,
    },
  );

  useEffect(() => {
    if (!isPlaying) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isPlaying]);

  // Таймер 30 секунд
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      const currentState = useGameStore.getState();
      const newTime = currentState.timeLeft - 1;
      if (newTime <= 0) {
        clearInterval(timer);
        setFinalScore(currentState.score);
        send({ type: "GAME_OVER" });
        setIsPlaying(false);
      } else {
        useGameStore.setState({ timeLeft: newTime });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, send, setIsPlaying, onGameEnd]);

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
    send({ type: "START" });
    setBasketX(canvasWidth / 2 - BASKET_WIDTH / 2);
    clearObjects();
  };

  return (
    <div className="relative flex flex-col justify-center bg-black/40 rounded-xl overflow-hidden">
      <button
        onClick={() => endGame(null)}
        className="absolute top-2 left-2 z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white cursor-pointer">
        ← Exit
      </button>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white">
        🍎 Score: {score}
      </div>
      <div className="absolute top-2 right-2 z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white">
        ⏱️ {isGameOver ? 0 : timeLeft}s
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-auto touch-none cursor-pointer"
        style={{ touchAction: "none" }}
        {...bind()}
      />

      {!isPlaying && state.matches("idle") && (
        <button
          onClick={startGame}
          className="absolute inset-0 m-auto w-40 h-12 bg-green-600 rounded-lg text-white font-bold shadow-lg hover:bg-green-700 transition">
          Start Game
        </button>
      )}

      {!isPlaying && state.matches("gameOver") && (
        <div className="absolute inset-0 m-auto w-70 h-45 items-center flex flex-col rounded-lg bg-gray-900 text-white font-pixel m-4 p-4">
          <h2 className="text-2xl mb-4">Game Over</h2>
          <p className="text-xl mb-4">Your score: {finalScore ?? score}</p>
          <button
            onClick={() => {
              onGameEnd?.(finalScore ?? score);
              resetGame();
            }}
            className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">
            Back to Games
          </button>
        </div>
      )}
    </div>
  );
};
