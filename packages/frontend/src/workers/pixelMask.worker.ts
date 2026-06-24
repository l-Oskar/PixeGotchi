/// <reference lib="webworker" />

self.onmessage = (e: MessageEvent) => {
  const { bitmap, width, height, threshold } = e.data as {
    bitmap: ImageBitmap;
    width: number;
    height: number;
    threshold: number;
  };

  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);

  const { data } = ctx.getImageData(0, 0, width, height);

  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    mask[i] = r > threshold || g > threshold || b > threshold ? 1 : 0;
  }

  self.postMessage({ mask, width, height }, [mask.buffer]);
};
