import { TonConnectUIProvider } from "@tonconnect/ui-react";

import { App } from "@/components/App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.tsx";
import { publicUrl } from "@/helpers/publicUrl.ts";

const MODE = import.meta.env.MODE_ENV || "production";
const MANIFEST_URL = import.meta.env.VITE_TON_MANIFEST_URL;
const VERSION = "V2";

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div className="min-h-screen bg-pixel-bg p-3 text-pixel-ink">
      <div className="pixel-panel mx-auto mt-8 max-w-md p-4 text-center">
        <h2 className="font-pixel text-sm leading-5 text-pixel-red">
          Сталась помилка
        </h2>
        <p className="mt-2 font-pixel text-[9px] leading-4 text-pixel-muted">
          Обнови сторінку через меню Telegram.
        </p>
        <div className="pixel-panel-soft mt-3 p-2 text-left">
          <code className="break-all font-pixel text-[7px] leading-4 text-pixel-muted">
            {error instanceof Error
              ? error.message
              : typeof error === "string"
                ? error
                : JSON.stringify(error)}
          </code>
        </div>
      </div>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <TonConnectUIProvider
        manifestUrl={
          MODE === "development"
            ? `${MANIFEST_URL}${VERSION}.json`
            : publicUrl(`tonconnect-manifest-${VERSION}.json`)
        }>
        <App />
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}
