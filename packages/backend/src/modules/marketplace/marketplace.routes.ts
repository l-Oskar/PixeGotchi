import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { MarketplaceController } from "./marketplace.controller";

const COSMETIC_MARKETPLACE_ENABLED =
  process.env.ENABLE_COSMETIC_MARKETPLACE === "true";

const marketplaceDisabled = async (
  _request: FastifyRequest,
  reply: FastifyReply,
) =>
  reply.code(503).send({
    message: "Cosmetic marketplace is not available yet",
  });

export async function marketplaceRoutes(app: FastifyInstance) {
  const controller = new MarketplaceController();

  app.addHook("onRequest", app.authenticate);

  if (!COSMETIC_MARKETPLACE_ENABLED) {
    app.get("/listings", async () => ({ listings: [] }));
    app.post("/listings", marketplaceDisabled);
    app.post("/listings/:listingId/buy", marketplaceDisabled);
    app.delete("/listings/:listingId", marketplaceDisabled);
    return;
  }

  app.get("/listings", controller.getListings.bind(controller));
  app.post("/listings", controller.createListing.bind(controller));
  app.post("/listings/:listingId/buy", controller.buyListing.bind(controller));
  app.delete(
    "/listings/:listingId",
    controller.cancelListing.bind(controller),
  );
}
