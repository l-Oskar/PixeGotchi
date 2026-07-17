// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import VaultPage from "./VaultPage";

const vaultPet = {
  id: 77,
  userId: 1,
  eggId: 11,
  nftAddress: null,
  genomeHash: "test-genome",
  element: "fire",
  rarity: "common",
  gender: "male",
  traits: [],
  name: "Ember",
  status: "vault",
  level: 100,
  experience: 0,
  health: 100,
  hunger: 100,
  energy: 100,
  happiness: 100,
  cleanliness: 100,
  healthZeroAt: null,
  criticalSince: null,
  lastFedAt: null,
  lastPlayedAt: null,
  lastSleptAt: null,
  lastCleanedAt: null,
  lastHealedAt: null,
  lastBoostedAt: null,
  lastUpdateAt: null,
  hatchedAt: null,
};

vi.mock("@/services/queries/vault.queries", () => ({
  useStatsVault: () => ({
    isLoading: false,
    data: [
      {
        element: "fire",
        count: 1,
        bestRarity: "common",
        highestLevel: 100,
        isEmpty: false,
      },
    ],
  }),
  useAllVault: () => ({
    data: [vaultPet],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/services/queries/pixegotchi.queries", () => ({
  usePixegotchiToVault: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  usePixegotchiFromVault: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/services/queries/marketplace.queries", () => ({
  useMarketplaceListings: () => ({
    data: { listings: [] },
  }),
}));

vi.mock("@/hooks/useConfirmationModal", () => ({
  useConfirmationModal: () => ({
    confirm: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("@/hooks/useFeedbackModal", () => ({
  useFeedbackModal: () => ({
    showError: vi.fn(),
    showApiError: vi.fn(),
  }),
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    showSuccessToast: vi.fn(),
  }),
}));

vi.mock("@/utils/getImage", () => ({
  getPixegotchiImg: () => "pixegotchi.png",
}));

vi.mock("@/components/Modals/VaultPetModal", () => ({
  default: ({
    isOpen,
    actions,
  }: {
    isOpen: boolean;
    actions?: React.ReactNode;
  }) => (isOpen ? <div role="dialog">{actions}</div> : null),
}));

vi.mock("@/pages/MarketplacePage/MarketplaceSellModal", () => ({
  default: ({
    isOpen,
    initialAssetKey,
  }: {
    isOpen: boolean;
    initialAssetKey?: string;
  }) =>
    isOpen ? (
      <div data-testid="vault-sell-modal" role="dialog">
        {initialAssetKey}
      </div>
    ) : null,
}));

afterEach(cleanup);

describe("Vault marketplace action", () => {
  it("opens the shared sell modal for a level 100 Pixegotchi", async () => {
    const user = userEvent.setup();
    render(<VaultPage onNavigate={vi.fn()} />);

    await user.click(
      screen.getByRole("button", {
        name: "View fire Pixegotchi collection",
      }),
    );

    const sellButton = screen.getByRole("button", { name: "Sell" });
    expect((sellButton as HTMLButtonElement).disabled).toBe(false);

    await user.click(sellButton);

    expect(screen.getByTestId("vault-sell-modal").textContent).toBe(
      "pixegotchi-77",
    );
  });
});
