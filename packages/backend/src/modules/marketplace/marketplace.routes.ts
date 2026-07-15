import type { FastifyInstance } from "fastify";
import { MarketplaceController } from "./marketplace.controller";

export async function marketplaceRoutes(app: FastifyInstance) {
  const controller = new MarketplaceController();

  app.addHook("onRequest", app.authenticate);

  app.get("/listings", controller.getListings.bind(controller));
  app.post("/listings", controller.createListing.bind(controller));
  app.post("/listings/:listingId/buy", controller.buyListing.bind(controller));
  app.delete(
    "/listings/:listingId",
    controller.cancelListing.bind(controller),
  );
}
