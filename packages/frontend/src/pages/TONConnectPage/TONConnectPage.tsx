import { viewport } from "@tma.js/sdk";
import { openLink, useSignal } from "@tma.js/sdk-react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import type { CSSProperties, FC, ReactNode } from "react";

import { Page } from "@/components/Page.tsx";

import "./TONConnectPage.css";

interface DataSectionProps {
  title: string;
  rows: Array<{
    title: string;
    value: ReactNode;
  }>;
}

const DataSection: FC<DataSectionProps> = ({ title, rows }) => (
  <section className="pixel-panel min-w-0 p-3">
    <h2 className="mb-3 font-pixel text-[10px] leading-4 text-pixel-ink">
      {title}
    </h2>
    <div className="grid gap-2">
      {rows.map((row) => (
        <div
          key={row.title}
          className="pixel-panel-soft grid min-w-0 gap-1 p-2 font-pixel text-[8px] leading-4">
          <span className="text-pixel-muted">{row.title}</span>
          <span className="min-w-0 break-words text-pixel-ink [overflow-wrap:anywhere]">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export const TONConnectPage: FC = () => {
  const wallet = useTonWallet();
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);
  const topInset = Math.max(
    0,
    (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0),
  );
  const pageStyle = {
    "--ton-connect-safe-top": `${topInset}px`,
  } as CSSProperties;

  if (!wallet) {
    return (
      <Page>
        <div className="ton-connect-page" style={pageStyle}>
          <section className="pixel-panel p-4 text-center">
            <h1 className="font-pixel text-sm leading-5 text-pixel-ink">
              TON Connect
            </h1>
            <p className="mx-auto mt-3 max-w-xs font-pixel text-[8px] leading-4 text-pixel-muted">
              Connect your wallet to view TON account data.
            </p>
            <TonConnectButton className="ton-connect-page__button" />
          </section>
        </div>
      </Page>
    );
  }

  const {
    account: { chain, publicKey, address },
    device: { appName, appVersion, maxProtocolVersion, platform, features },
  } = wallet;

  return (
    <Page>
      <div className="ton-connect-page" style={pageStyle}>
        {"imageUrl" in wallet && (
          <section className="pixel-panel min-w-0 p-3">
            <div className="flex items-center gap-3">
              <img
                src={wallet.imageUrl}
                alt="Provider logo"
                className="pixel-icon-box h-14 w-14 shrink-0 object-contain p-2"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-pixel text-sm leading-5 text-pixel-ink">
                  {wallet.name}
                </h1>
                <p className="mt-1 truncate font-pixel text-[8px] leading-3 text-pixel-muted">
                  {wallet.appName}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="pixel-button px-3 py-2 font-pixel text-[8px] leading-4"
                onClick={(event) => {
                  event.preventDefault();
                  openLink(wallet.aboutUrl);
                }}>
                About wallet
              </button>
              <TonConnectButton className="ton-connect-page__button-connected" />
            </div>
          </section>
        )}

        <DataSection
          title="Account"
          rows={[
            { title: "Address", value: address },
            { title: "Chain", value: chain },
            { title: "Public Key", value: publicKey },
          ]}
        />
        <DataSection
          title="Device"
          rows={[
            { title: "App Name", value: appName },
            { title: "App Version", value: appVersion },
            { title: "Max Protocol Version", value: maxProtocolVersion },
            { title: "Platform", value: platform },
            {
              title: "Features",
              value: features
                .map((feature) =>
                  typeof feature === "object" ? feature.name : undefined,
                )
                .filter(Boolean)
                .join(", "),
            },
          ]}
        />
      </div>
    </Page>
  );
};
