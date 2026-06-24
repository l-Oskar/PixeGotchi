import { TonConnectUIProvider } from "@tonconnect/ui-react";

import { App } from "@/components/App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.tsx";
import { publicUrl } from "@/helpers/publicUrl.ts";

const MODE = import.meta.env.MODE_ENV || "production";
const MANIFEST_URL = import.meta.env.VITE_TON_MANIFEST_URL;
const VERSION = "V2";

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div className="text-white text-center">
      <h2 className="text-2xl">Сталась полилка.</h2>
      <h2 className="text-2xl">Обновіть сторінку!</h2>
      <h2 className="text-2xl">
        ↗️ Правий куток | (···) Три крапки | 🔄 Перезавантажити
      </h2>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
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
