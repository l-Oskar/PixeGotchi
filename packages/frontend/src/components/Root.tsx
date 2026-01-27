import { TonConnectUIProvider } from "@tonconnect/ui-react";

import { App } from "@/components/App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.tsx";
import { publicUrl } from "@/helpers/publicUrl.ts";

const MODE = import.meta.env.MODE_ENV || "production";
const MANIFEST_URL = import.meta.env.VITE_TON_MANIFEST_URL;
const VERSION = "V2";

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
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
