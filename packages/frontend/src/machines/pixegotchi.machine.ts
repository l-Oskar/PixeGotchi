import { setup, assign } from "xstate";
import type { Pixegotchi, PixegotchiStatus } from "@shared";

export interface PixegotchiMachineInput {
  pixegotchiId: number;
  userId: number;
}

interface PixegotchiMachineContext {
  pixegotchiId: number;
  userId: number;
  pixegotchi: Pixegotchi | null;
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
  genome: unknown | null;
  status: PixegotchiStatus;
  level: number;
  lastServerSync: number;
  lastUpdateAt: number;
  tickCount: number;
  criticalSince: number | null;
  hungerRate: number;
  energyRate: number;
  happinesRate: number;
  cleanlinessRate: number;
  syncErrors: number;
  lastError: string | null;
}

type PixegotchiPayload = Pixegotchi &
  Partial<{
    genome: unknown;
    hungerRate: number | string;
    energyRate: number | string;
    happinesRate: number | string;
    cleanlinessRate: number | string;
  }>;

const toNumber = (value: number | string | null | undefined, fallback: number) =>
  typeof value === "number" ? value : Number(value ?? fallback);

const toTime = (value: Date | string | null | undefined) =>
  value ? new Date(value).getTime() : Date.now();

export const pixegotchiMachine = setup({
  types: {
    context: {} as PixegotchiMachineContext,
    input: {} as PixegotchiMachineInput,
    events: {} as
      | { type: "FEED" }
      | { type: "SLEEP" }
      | { type: "PLAY" }
      | { type: "CLEAN" }
      | { type: "HEAL" }
      | { type: "RETRY" }
      | { type: "LOAD_SUCCESS"; data: PixegotchiPayload }
      | { type: "LOAD_ERROR"; data: unknown }
      | { type: "PAUSE_DEGRADATION" }
      | { type: "RESUME_DEGRADATION" }
      | { type: "SYNC_SUCCESS"; data: any }
      | { type: "SYNC_ERROR"; data: any }
      | { type: "ENTER_CRITICAL" }
      | { type: "CHECK_CRITICAL" },
  },

  actions: {
    // === Initialization ===
    initializeFromData: assign(({ event }) => {
      const data = event.type === "LOAD_SUCCESS" ? event.data : null;
      return {
        pixegotchiId: data?.id || 0,
        userId: data?.userId || 0,
        pixegotchi: data,
        health: toNumber(data?.health, 100),
        hunger: toNumber(data?.hunger, 70),
        energy: toNumber(data?.energy, 100),
        happiness: toNumber(data?.happiness, 50),
        cleanliness: toNumber(data?.cleanliness, 100),
        genome: data?.genome ?? null,
        status: (data?.status || "active") as PixegotchiStatus,
        level: data?.level || 1,
        hungerRate: toNumber(data?.hungerRate, 1.0),
        energyRate: toNumber(data?.energyRate, 1.0),
        happinesRate: toNumber(data?.happinesRate, 1.0),
        cleanlinessRate: toNumber(data?.cleanlinessRate, 1.0),
        lastUpdateAt: toTime(data?.lastUpdateAt),
        lastError: null,
      };
    }),

    handleInitError: assign(() => ({
      lastError: "Failed to load pixegotchi",
    })),

    // === Stat Degradation (per second) ===
    degradeStats: assign(({ context }) => {
      // Convert per-hour rates to per-second
      const hungerPerSecond = context.hungerRate / 3600;
      const energyPerSecond = context.energyRate / 3600;
      const happinessPerSecond = context.happinesRate / 3600;
      const cleanlinessPerSecond = context.cleanlinessRate / 3600;

      return {
        hunger: Math.max(0, context.hunger - hungerPerSecond),
        energy: Math.max(0, context.energy - energyPerSecond),
        happiness: Math.max(0, context.happiness - happinessPerSecond),
        cleanliness: Math.max(0, context.cleanliness - cleanlinessPerSecond),
        tickCount: context.tickCount + 1,
      };
    }),

    // === Player Actions ===
    feed: assign(({ context }) => ({
      hunger: Math.min(100, context.hunger + 30),
    })),

    updateHappiness: assign(({ context }) => ({
      happiness: Math.min(100, context.happiness + 5),
    })),

    sleep: assign({
      energy: 100,
    }),

    play: assign(({ context }) => ({
      happiness: Math.min(100, context.happiness + 25),
    })),

    expendEnergy: assign(({ context }) => ({
      energy: Math.max(0, context.energy - 20),
    })),

    clean: assign({
      cleanliness: 100,
    }),

    // === Health Check ===
    checkHealth: assign(({ context }) => {
      let health = context.health;

      // Hunger affects health
      if (context.hunger > 80) health -= 1;
      if (context.hunger === 0) health -= 5;

      // Cleanliness affects health
      if (context.cleanliness < 20) health -= 1;

      // Happiness affects health
      if (context.happiness < 20) health -= 1;

      // Energy affects health
      if (context.energy === 0) health -= 5;

      // Regenerate if all good
      if (
        context.hunger < 50 &&
        context.cleanliness > 70 &&
        context.happiness > 50
      ) {
        health = Math.min(100, health + 1);
      }

      return {
        health: Math.max(0, Math.min(100, health)),
      };
    }),

    // === Server Sync ===
    syncWithServer: () => {
      console.log("Syncing with server...");
    },

    retrySync: () => {
      console.log("Retrying sync...");
    },

    clearSyncError: assign({
      syncErrors: 0,
      lastError: null,
    }),

    handleSyncError: assign(({ context }) => ({
      syncErrors: context.syncErrors + 1,
      lastError: "Sync failed, will retry",
    })),

    // === Critical State ===
    enterCritical: assign(() => ({
      status: "critical" as const,
      criticalSince: Date.now(),
    })),

    onEnterCritical: ({ context }) => {
      console.log(`Pixegotchi ${context.pixegotchiId} entered CRITICAL state`);
    },

    resurrect: assign({
      health: 50,
      status: "active" as const,
      criticalSince: null,
    }),

    onTimeout: ({ context }) => {
      console.log(`Pixegotchi ${context.pixegotchiId} grace period expired`);
    },

    onDeath: ({ context }) => {
      console.log(`Pixegotchi ${context.pixegotchiId} DIED`);
    },
  },

  guards: {
    isHealthCritical: ({ context }) => context.health <= 0,

    hasResurrectionItem: () => {
      // TODO: Check inventory for resurrection item
      return false;
    },

    isGracePeriodExpired: ({ context }) => {
      if (!context.criticalSince) return false;
      return Date.now() - context.criticalSince > 2592000000; // 30 days
    },
  },
}).createMachine({
  id: "pixegotchi",
  initial: "initializing",

  context: ({ input }) => ({
    pixegotchiId: input.pixegotchiId,
    userId: input.userId,
    pixegotchi: null,
    health: 100,
    hunger: 70,
    energy: 100,
    happiness: 50,
    cleanliness: 100,
    genome: null,
    status: "active" as const,
    level: 1,
    lastServerSync: Date.now(),
    lastUpdateAt: Date.now(),
    tickCount: 0,
    criticalSince: null,
    hungerRate: 1.0,
    energyRate: 1.0,
    happinesRate: 1.0,
    cleanlinessRate: 1.0,
    syncErrors: 0,
    lastError: null,
  }),

  states: {
    // ============================================
    // INITIALIZING - Load pixegotchi from server
    // ============================================
    initializing: {
      on: {
        LOAD_SUCCESS: {
          target: "active",
          actions: "initializeFromData",
        },
        LOAD_ERROR: {
          target: "error",
          actions: "handleInitError",
        },
      },
    },

    // ============================================
    // ACTIVE - Main state (parallel processes)
    // ============================================
    active: {
      type: "parallel",

      states: {
        // === Stat Degradation ===
        degradation: {
          initial: "running",
          states: {
            running: {
              after: {
                1000: {
                  target: "running",
                  actions: "degradeStats",
                },
              },
            },
            paused: {},
          },
          on: {
            PAUSE_DEGRADATION: ".paused",
            RESUME_DEGRADATION: ".running",
          },
        },

        // === Server Synchronization ===
        synchronization: {
          initial: "syncing",
          states: {
            syncing: {
              after: {
                30000: {
                  target: "syncing",
                  actions: "syncWithServer",
                },
              },
            },
            error: {
              after: {
                5000: {
                  target: "syncing",
                  actions: "retrySync",
                },
              },
            },
          },
          on: {
            SYNC_SUCCESS: {
              target: ".syncing",
              actions: "clearSyncError",
            },
            SYNC_ERROR: {
              target: ".error",
              actions: "handleSyncError",
            },
          },
        },

        // === Health Monitoring ===
        healthMonitoring: {
          initial: "monitoring",
          states: {
            monitoring: {
              after: {
                5000: {
                  target: "monitoring",
                  actions: "checkHealth",
                },
              },
            },
          },
        },
      },

      // === Transitions from ACTIVE ===
      on: {
        // Player actions
        FEED: {
          actions: ["feed", "updateHappiness"],
        },
        SLEEP: {
          actions: "sleep",
        },
        PLAY: {
          actions: ["play", "expendEnergy"],
        },
        CLEAN: {
          actions: "clean",
        },

        // Health check
        ENTER_CRITICAL: {
          guard: "isHealthCritical",
          target: "critical",
          actions: "enterCritical",
        },
      },
    },

    // ============================================
    // CRITICAL - Health = 0 (30 day grace period)
    // ============================================
    critical: {
      entry: "onEnterCritical",

      // Automatic transition after 30 days
      after: {
        2592000000: {
          target: "dead",
          actions: "onTimeout",
        },
      },

      on: {
        // Try to save with resurrection item
        HEAL: {
          guard: "hasResurrectionItem",
          target: "active",
          actions: "resurrect",
        },

        // Manual check for grace period expiration
        CHECK_CRITICAL: [
          {
            guard: "isGracePeriodExpired",
            target: "dead",
            actions: "onTimeout",
          },
        ],
      },
    },

    // ============================================
    // DEAD - Final state
    // ============================================
    dead: {
      type: "final",
      entry: "onDeath",
    },

    // ============================================
    // ERROR - Error state
    // ============================================
    error: {
      on: {
        RETRY: "initializing",
      },
    },
  },
});
