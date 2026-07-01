import { assign, setup } from "xstate";
import type { PixegotchiStatus } from "@pixegotchi/shared";

interface PixegotchiUiContext {
  selectedItemId: string | null;
  selectedQuantity: number;
  lastStatus: PixegotchiStatus | null;
  lastError: string | null;
}

type PixegotchiUiEvent =
  | { type: "DATA_SYNCED"; status: PixegotchiStatus | null }
  | { type: "ACTION_REQUESTED"; itemId: string; canUseWhileBlocked?: boolean }
  | { type: "ACTION_CONFIRMED"; itemId: string; quantity: number }
  | { type: "MUTATION_SUCCEEDED" }
  | { type: "MUTATION_FAILED"; error: unknown }
  | { type: "CANCEL" }
  | { type: "RETRY" };

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Action failed";
};

export const pixegotchiUiMachine = setup({
  types: {
    context: {} as PixegotchiUiContext,
    events: {} as PixegotchiUiEvent,
  },
  actions: {
    syncStatus: assign(({ event }) => {
      if (event.type !== "DATA_SYNCED") return {};
      return { lastStatus: event.status, lastError: null };
    }),
    selectItem: assign(({ event }) => {
      if (event.type !== "ACTION_REQUESTED") return {};
      return {
        selectedItemId: event.itemId,
        selectedQuantity: 1,
        lastError: null,
      };
    }),
    confirmAction: assign(({ event }) => {
      if (event.type !== "ACTION_CONFIRMED") return {};
      return {
        selectedItemId: event.itemId,
        selectedQuantity: event.quantity,
        lastError: null,
      };
    }),
    clearAction: assign({
      selectedItemId: null,
      selectedQuantity: 1,
      lastError: null,
    }),
    clearError: assign({
      lastError: null,
    }),
    setError: assign(({ event }) => {
      if (event.type !== "MUTATION_FAILED") return {};
      return { lastError: getErrorMessage(event.error) };
    }),
  },
  guards: {
    isCritical: ({ event }) =>
      event.type === "DATA_SYNCED" && event.status === "critical",
    isDead: ({ event }) =>
      event.type === "DATA_SYNCED" && event.status === "dead",
    isVault: ({ event }) =>
      event.type === "DATA_SYNCED" && event.status === "vault",
    canUseWhileBlocked: ({ event }) =>
      event.type === "ACTION_REQUESTED" && event.canUseWhileBlocked === true,
  },
}).createMachine({
  id: "pixegotchiUi",
  initial: "bootstrapping",
  context: {
    selectedItemId: null,
    selectedQuantity: 1,
    lastStatus: null,
    lastError: null,
  },
  on: {
    DATA_SYNCED: [
      {
        guard: "isCritical",
        target: ".blocked.critical",
        actions: "syncStatus",
      },
      {
        guard: "isDead",
        target: ".blocked.dead",
        actions: "syncStatus",
      },
      {
        guard: "isVault",
        target: ".blocked.vault",
        actions: "syncStatus",
      },
      {
        target: ".ready.idle",
        actions: "syncStatus",
      },
    ],
  },
  states: {
    bootstrapping: {},
    ready: {
      initial: "idle",
      states: {
        idle: {
          entry: "clearAction",
          on: {
            ACTION_REQUESTED: {
              target: "selectingItem",
              actions: "selectItem",
            },
          },
        },
        selectingItem: {
          always: {
            target: "confirmingAction",
          },
          on: {
            ACTION_REQUESTED: {
              target: "confirmingAction",
              actions: "selectItem",
            },
            CANCEL: {
              target: "idle",
            },
          },
        },
        confirmingAction: {
          on: {
            ACTION_CONFIRMED: {
              target: "submittingAction",
              actions: "confirmAction",
            },
            ACTION_REQUESTED: {
              actions: "selectItem",
            },
            CANCEL: {
              target: "idle",
            },
          },
        },
        submittingAction: {
          on: {
            MUTATION_SUCCEEDED: {
              target: "actionSuccess",
              actions: "clearError",
            },
            MUTATION_FAILED: {
              target: "actionError",
              actions: "setError",
            },
          },
        },
        actionSuccess: {
          after: {
            700: {
              target: "idle",
            },
          },
        },
        actionError: {
          on: {
            RETRY: {
              target: "confirmingAction",
              actions: "clearError",
            },
            ACTION_CONFIRMED: {
              target: "submittingAction",
              actions: "confirmAction",
            },
            CANCEL: {
              target: "idle",
            },
          },
        },
      },
    },
    blocked: {
      initial: "critical",
      on: {
        ACTION_REQUESTED: {
          guard: "canUseWhileBlocked",
          target: "#pixegotchiUi.ready.confirmingAction",
          actions: "selectItem",
        },
      },
      states: {
        critical: {},
        dead: {},
        vault: {},
      },
    },
  },
});

export const pixegotchiMachine = pixegotchiUiMachine;
