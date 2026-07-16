import {
  Component,
  type CSSProperties,
  type ComponentType,
  type GetDerivedStateFromError,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";

function ErrorFallbackSafeArea({ children }: PropsWithChildren) {
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);
  const safeAreaInsetBottom = useSignal(viewport.safeAreaInsetBottom);
  const contentSafeAreaInsetBottom = useSignal(
    viewport.contentSafeAreaInsetBottom,
  );
  const topInset = Math.max(
    0,
    (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0),
  );
  const bottomInset = Math.max(
    0,
    (safeAreaInsetBottom ?? 0) + (contentSafeAreaInsetBottom ?? 0),
  );

  return (
    <div
      className="box-border min-h-[100dvh] bg-pixel-bg"
      style={
        {
          paddingTop: `max(${topInset}px, env(safe-area-inset-top))`,
          paddingRight: "env(safe-area-inset-right)",
          paddingBottom: `max(${bottomInset}px, env(safe-area-inset-bottom))`,
          paddingLeft: "env(safe-area-inset-left)",
        } as CSSProperties
      }>
      {children}
    </div>
  );
}

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode | ComponentType<{ error: unknown }>;
}

interface ErrorBoundaryState {
  error?: unknown;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError: GetDerivedStateFromError<ErrorBoundaryProps, ErrorBoundaryState> = (error) => ({ error });

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    const {
      state: {
        error,
      },
      props: {
        fallback: Fallback,
        children,
      },
    } = this;

    if (!("error" in this.state)) {
      return children;
    }

    return (
      <ErrorFallbackSafeArea>
        {typeof Fallback === "function" ? (
          <Fallback error={error} />
        ) : (
          Fallback
        )}
      </ErrorFallbackSafeArea>
    );
  }
}
