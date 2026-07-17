import { describe, expect, it } from "vitest";
import {
  calculateMarketplaceSalePreview,
  multiplyMarketplaceMoney,
} from "./marketplace-money";

describe("marketplace fixed-point money", () => {
  it("calculates subtotal without floating-point drift", () => {
    expect(multiplyMarketplaceMoney("0.12345678", 3)).toBe("0.37037034");
  });

  it("rounds the five-percent fee half up to eight decimals", () => {
    expect(
      calculateMarketplaceSalePreview(
        "1.0000001",
        1,
        500,
        "1",
        "1000000000",
      ),
    ).toEqual({
      gross: "1.0000001",
      fee: "0.05000001",
      proceeds: "0.95000009",
    });
  });

  it("returns the expected 5 x 100 commission example", () => {
    expect(
      calculateMarketplaceSalePreview(
        "100",
        5,
        500,
        "1",
        "1000000000",
      ),
    ).toEqual({
      gross: "500",
      fee: "25",
      proceeds: "475",
    });
  });

  it("rejects a unit price outside marketplace limits", () => {
    expect(
      calculateMarketplaceSalePreview(
        "1000000001",
        1,
        500,
        "1",
        "1000000000",
      ),
    ).toBeNull();
  });
});
