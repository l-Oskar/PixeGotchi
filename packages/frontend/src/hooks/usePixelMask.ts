// usePixelMask.ts
import { useRef, useCallback } from "react";

export interface PixelMask {
  mask: Uint8Array; // flat масив: mask[y * width + x] === 1 → видимий піксель
  width: number;
  height: number;
}

/**
 * Будує pixel-маску спрайту у Web Worker щоб не блокувати main thread.
 * Використовує ImageBitmap + transferable буфери для нульового копіювання.
 */
export function usePixelMask() {
  const maskRef = useRef<PixelMask | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const buildMask = useCallback(
    (img: HTMLImageElement, threshold = 30): Promise<PixelMask> => {
      return new Promise((resolve, reject) => {
        // Завершуємо попередній воркер якщо є
        workerRef.current?.terminate();

        const worker = new Worker(
          new URL("../workers/pixelMask.worker.ts", import.meta.url),
          { type: "module" },
        );
        workerRef.current = worker;

        // createImageBitmap — асинхронний, не блокує UI
        createImageBitmap(img).then((bitmap) => {
          worker.postMessage(
            {
              bitmap,
              width: bitmap.width,
              height: bitmap.height,
              threshold,
            },
            // Transferable: bitmap передається без копіювання
            [bitmap],
          );
        });

        worker.onmessage = (e: MessageEvent) => {
          const result: PixelMask = e.data;
          maskRef.current = result;
          worker.terminate();
          workerRef.current = null;
          resolve(result);
        };

        worker.onerror = (err) => {
          worker.terminate();
          workerRef.current = null;
          reject(err);
        };
      });
    },
    [],
  );

  /**
   * Inline-перевірка по масці — викликається кожен кадр.
   * Flat Uint8Array + пряма індексація = максимальна швидкість.
   */
  const checkPixel = useCallback((maskX: number, maskY: number): boolean => {
    const m = maskRef.current;
    if (!m) return true; // маска ще не готова — вважаємо видимим
    if (maskX < 0 || maskX >= m.width || maskY < 0 || maskY >= m.height)
      return false;
    return m.mask[maskY * m.width + maskX] === 1;
  }, []);

  return { maskRef, buildMask, checkPixel };
}
