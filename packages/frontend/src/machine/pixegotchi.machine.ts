// // frontend/src/machines/pixegotchi.machine.ts

// import { setup, assign } from "xstate";
// import type { PixegotchiContext } from "../types/pixegotchi";

// // ⚠️ У v5 синтаксис трохи змінився

// export const pixegotchiMachine = setup({
//   types: {
//     context: {} as PixegotchiContext,
//     events: {} as
//       | { type: "FEED" }
//       | { type: "START_SLEEP" }
//       | { type: "STOP_SLEEP" }
//       | { type: "PLAY" }
//       | { type: "CLEAN" }
//       | { type: "HEAL" }
//       | { type: "RETRY" }
//       | { type: "PAUSE_DEGRADATION" }
//       | { type: "RESUME_DEGRADATION" }
//       | { type: "SYNC_SUCCESS"; data: any }
//       | { type: "SYNC_ERROR"; data: any }
//       | { type: "ENTER_CRITICAL" }
//       | { type: "CHECK_CRITICAL" },
//   },
//   actions: {
//     degradeStats: assign(({ context }) => ({
//       hunger: Math.max(0, context.hunger - context.hungerRate / 3600),
//       energy: Math.max(0, context.energy - context.energyRate / 3600),
//       happiness: Math.max(0, context.happiness - context.happinesRate / 3600),
//       cleanliness: Math.max(
//         0,
//         context.cleanliness - context.cleanlinessRate / 3600,
//       ),
//       tickCount: context.tickCount + 1,
//     })),

//     feed: assign(({ context }) => ({
//       hunger: Math.min(100, context.hunger + 30),
//     })),

//     updateHappiness: assign(({ context }) => ({
//       happiness: Math.min(100, context.happiness + 5),
//     })),

//     sleep: assign({
//       energy: 100,
//     }),

//     play: assign(({ context }) => ({
//       happiness: Math.min(100, context.happiness + 25),
//     })),

//     expendEnergy: assign(({ context }) => ({
//       energy: Math.max(0, context.energy - 20),
//     })),

//     clean: assign({
//       cleanliness: 100,
//     }),

//     checkHealth: assign(({ context }) => {
//       let health = context.health;

//       if (context.hunger > 80) health -= 1;
//       if (context.hunger === 0) health -= 5;
//       if (context.cleanliness < 20) health -= 1;
//       if (context.happiness < 20) health -= 1;

//       if (
//         context.hunger < 50 &&
//         context.cleanliness > 70 &&
//         context.happiness > 50
//       ) {
//         health = Math.min(100, health + 1);
//       }

//       return {
//         health: Math.max(0, Math.min(100, health)),
//       };
//     }),

//     enterCritical: assign({
//       status: "critical" as const,
//       criticalSince: () => Date.now(),
//     }),

//     resurrect: assign({
//       health: 50,
//       status: "active" as const,
//       criticalSince: null,
//     }),

//     onEnterCritical: () => {
//       console.log("Entered CRITICAL state");
//     },

//     onDeath: () => {
//       console.log("Pixegotchi DIED");
//     },
//   },

//   guards: {
//     hasResurrectionItem: () => {
//       // TODO: перевірити inventory
//       return false;
//     },

//     isHealthCritical: ({ context }) => context.health <= 0,
//   },
// }).createMachine({
//   id: "pixegotchi",
//   initial: "initializing",

//   context: {
//     pixegotchiId: 0,
//     userId: 0,
//     pixegotchi: null,
//     health: 100,
//     hunger: 70,
//     energy: 100,
//     happiness: 50,
//     cleanliness: 100,
//     genome: null,
//     status: "active" as const,
//     level: 1,
//     lastServerSync: Date.now(),
//     lastUpdateAt: Date.now(),
//     tickCount: 0,
//     criticalSince: null,
//     hungerRate: 1.0,
//     energyRate: 1.0,
//     happinesRate: 1.0,
//     cleanlinessRate: 1.0,
//     syncErrors: 0,
//     lastError: null,
//   },

//   states: {
//     initializing: {
//       invoke: {
//         src: async () => {
//           const response = await fetch("/api/pixegotchi/1");
//           return response.json();
//         },
//         onDone: {
//           target: "active",
//           actions: assign(({ event }) => {
//             const data = event.output;
//             return {
//               pixegotchiId: data.id,
//               userId: data.userId,
//               pixegotchi: data,
//               health: data.health,
//               hunger: data.hunger,
//               energy: data.energy,
//               happiness: data.happiness,
//               cleanliness: data.cleanliness,
//               genome: data.genome,
//               status: data.status,
//               level: data.level,
//             };
//           }),
//         },
//         onError: {
//           target: "error",
//           actions: assign({
//             lastError: "Failed to load pixegotchi",
//           }),
//         },
//       },
//     },

//     active: {
//       type: "parallel",

//       states: {
//         degradation: {
//           initial: "running",
//           states: {
//             running: {
//               after: {
//                 1000: {
//                   target: "running",
//                   actions: "degradeStats",
//                 },
//               },
//             },
//             paused: {},
//           },
//           on: {
//             PAUSE_DEGRADATION: ".paused",
//             RESUME_DEGRADATION: ".running",
//           },
//         },

//         synchronization: {
//           initial: "syncing",
//           states: {
//             syncing: {
//               after: {
//                 30000: {
//                   target: "syncing",
//                 },
//               },
//             },
//             error: {
//               after: {
//                 5000: {
//                   target: "syncing",
//                 },
//               },
//             },
//           },
//           on: {
//             SYNC_SUCCESS: {
//               target: ".syncing",
//             },
//             SYNC_ERROR: {
//               target: ".error",
//             },
//           },
//         },

//         healthMonitoring: {
//           initial: "monitoring",
//           states: {
//             monitoring: {
//               after: {
//                 5000: {
//                   target: "monitoring",
//                   actions: "checkHealth",
//                 },
//               },
//             },
//           },
//         },
//       },

//       on: {
//         FEED: {
//           actions: ["feed", "updateHappiness"],
//         },
//         SLEEP: {
//           actions: "sleep",
//         },
//         PLAY: {
//           actions: ["play", "expendEnergy"],
//         },
//         CLEAN: {
//           actions: "clean",
//         },
//         ENTER_CRITICAL: {
//           guard: "isHealthCritical",
//           target: "critical",
//           actions: "enterCritical",
//         },
//       },
//     },

//     critical: {
//       entry: "onEnterCritical",
//       after: {
//         2592000000: {
//           target: "dead",
//           actions: "onDeath",
//         },
//       },
//       on: {
//         HEAL: {
//           guard: "hasResurrectionItem",
//           target: "active",
//           actions: "resurrect",
//         },
//       },
//     },

//     dead: {
//       type: "final",
//       entry: "onDeath",
//     },

//     error: {
//       on: {
//         RETRY: "initializing",
//       },
//     },
//   },
// });
