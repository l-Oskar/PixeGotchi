import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { config } from "@/config/env";
import { MarketplaceController } from "./marketplace.controller";
import { MarketplaceService } from "./marketplace.service";

const EXPIRY_SWEEP_INTERVAL_MS = 15 * 60 * 1000;

const marketplaceDisabled = async (
  _request: FastifyRequest,
  reply: FastifyReply,
) =>
  reply.code(503).send({
    message: "Marketplace is not available yet",
  });

export async function marketplaceRoutes(app: FastifyInstance) {
  const controller = new MarketplaceController();
  const marketplaceService = new MarketplaceService();
  let expiryTimer: NodeJS.Timeout | undefined;

  app.addHook("onRequest", app.authenticate);
  app.get("/config", controller.getConfig.bind(controller));

  if (!config.marketplaceEnabled) {
    app.get("/listings", async () => ({ listings: [] }));
    app.get("/sellable", async () => ({
      assets: [],
      activeListingCount: 0,
      maxActiveListings: 0,
    }));
    app.post("/listings", marketplaceDisabled);
    app.post("/listings/:listingId/buy", marketplaceDisabled);
    app.delete("/listings/:listingId", marketplaceDisabled);
    return;
  }

  app.addHook("onReady", async () => {
    await marketplaceService.cleanupExpiredListings();
    expiryTimer = setInterval(() => {
      void marketplaceService.cleanupExpiredListings().catch((error) => {
        app.log.error(
          { err: error, event: "marketplace_expiry_sweep_failed" },
          "Marketplace expiry sweep failed",
        );
      });
    }, EXPIRY_SWEEP_INTERVAL_MS);
    expiryTimer.unref();
  });
  app.addHook("onClose", async () => {
    if (expiryTimer) clearInterval(expiryTimer);
  });

  app.get("/listings", controller.getListings.bind(controller));
  app.get("/sellable", controller.getSellableAssets.bind(controller));
  app.post("/listings", controller.createListing.bind(controller));
  app.post("/listings/:listingId/buy", controller.buyListing.bind(controller));
  app.delete(
    "/listings/:listingId",
    controller.cancelListing.bind(controller),
  );
}
