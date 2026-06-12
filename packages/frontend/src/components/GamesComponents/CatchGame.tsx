import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGameStore } from "../../store/game.store";
import { useMachine } from "@xstate/react";
import { gameMachine } from "../../machine/game.machine";
import { useDrag } from "@use-gesture/react";
import { useGameLoop } from "../../hooks/useGameLoop";

const BASKET_WIDTH = 60;
const BASKET_HEIGHT = 20;
const OBJECT_SIZE = 30;
const FALL_SPEED = 2.5;
const FRUIT_EMOJIS = ["🍎", "🍌", "🍒", "🍊"];
const BOMB_EMOJI = "💣";

export interface CatchGameProps {
  onGameEnd?: (score: number) => void;
  endGame: (n: null) => void;
}

export const CatchGame: React.FC<CatchGameProps> = ({ onGameEnd, endGame }) => {
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const isBomb = Math.random() < 0.25; // 25% bombs
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
      if (Math.random() < 0.4) spawnObject(); // spawn ~40% each 100ms = 4 per sec
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, spawnObject]);

  // Оновлення позицій та колізії (викликається в ігровому циклі)
  const updateObjects = useCallback(() => {
    if (!isPlaying) return;
    const currentObjects = [...useGameStore.getState().objects];
    let scoreDelta = 0;
    const toRemove: number[] = [];
    const now = performance.now();

    for (let i = 0; i < currentObjects.length; i++) {
      const obj = currentObjects[i];

      // Якщо об'єкт уже вибухає, перевіряємо, чи минуло 0.5 секунди
      if (obj.isExploding) {
        if (now - (obj.explodeStartTime || 0) >= 500) {
          toRemove.push(obj.id);
        }
        continue; // не рухаємо та не перевіряємо колізію для вибухаючих
      }

      // Рух звичайного об'єкта
      obj.y += FALL_SPEED;

      // Перевірка колізії з кошиком
      if (
        obj.y + OBJECT_SIZE >= canvasHeight - BASKET_HEIGHT &&
        obj.y <= canvasHeight
      ) {
        const basketLeft = basketX;
        const basketRight = basketX + BASKET_WIDTH;
        const objLeft = obj.x;
        const objRight = obj.x + OBJECT_SIZE;

        if (objRight > basketLeft && objLeft < basketRight) {
          if (obj.type === "fruit") {
            scoreDelta += 1;
            toRemove.push(obj.id); // фрукти зникають одразу
          } else {
            // Бомба: нараховуємо штраф і запускаємо вибух
            scoreDelta -= 10;
            obj.isExploding = true;
            obj.emoji = "💥";
            obj.explodeStartTime = now;
            // Не видаляємо одразу, а продовжуємо тримати в масиві
          }
          continue;
        }
      }

      // Видалення, якщо впало нижче екрану (і не вибухає)
      if (obj.y > canvasHeight && !obj.isExploding) {
        toRemove.push(obj.id);
      }
    }

    // Видаляємо тільки ті, що в toRemove (фрукти або вибухи, що закінчилися)
    toRemove.forEach((id) => removeObject(id));
    if (scoreDelta !== 0) addScore(scoreDelta);
  }, [isPlaying, basketX, canvasHeight, removeObject, addScore]);

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

    // Очистка
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Стиль піксельний – фон
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Малюємо об'єкти
    // В drawCanvas, коли малюємо об'єкт:
    objects.forEach((obj) => {
      ctx.font = `${OBJECT_SIZE}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (obj.isExploding) {
        // Додатковий ефект: червоне коло
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

    // Малюємо кошик
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

    // Додатковий декор
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      basketX,
      canvasHeight - BASKET_HEIGHT,
      BASKET_WIDTH,
      BASKET_HEIGHT,
    );
  }, [canvasWidth, canvasHeight, objects, basketX]);

  // Свайпи через useGesture
  const bind = useDrag(
    ({ delta: [dx], event }) => {
      event.preventDefault(); // явно блокуємо стандартну поведінку
      if (!isPlaying) return;
      const newX = basketX + dx;
      const maxX = canvasWidth - BASKET_WIDTH;
      setBasketX(Math.min(maxX, Math.max(0, newX)));
    },
    {
      pointer: { touch: true },
      preventDefault: true, // блокує скрол
    },
  );

  useEffect(() => {
    if (!isPlaying) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // блокує скрол на body
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
        setFinalScore(currentState.score); // запам'ятовуємо рахунок
        send({ type: "GAME_OVER" });
        setIsPlaying(false);
      } else {
        useGameStore.setState({ timeLeft: newTime });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, send, setIsPlaying, onGameEnd]);

  // Скидання гри при старті
  const startGame = () => {
    resetGame();
    setIsPlaying(true);
    send({ type: "START" });
    setBasketX(canvasWidth / 2 - BASKET_WIDTH / 2);
    clearObjects();
  };

  // Екран завершення
  if (state.matches("gameOver")) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white font-pixel p-4">
        <h2 className="text-2xl mb-4">Game Over</h2>
        <p className="text-xl mb-4">Your score: {finalScore ?? score}</p>
        <button
          onClick={() => onGameEnd?.(finalScore ?? score)}
          className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700">
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center bg-black/40 rounded-xl overflow-hidden">
      <div className="flex justify-between m-2">
        <button
          onClick={() => endGame(null)}
          className="z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white cursor-pointer">
          ← Exit
        </button>
        <div className="z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white">
          🍎 Score: {score}
        </div>
        <div className="z-10 bg-black/70 px-3 py-1 rounded-lg font-mono text-white">
          ⏱️ {timeLeft}s
        </div>
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
    </div>
  );
};
