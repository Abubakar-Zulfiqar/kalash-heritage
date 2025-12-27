import { ShippingRate } from "@/types";

/**
 * Shipping Service - Region-based shipping calculations
 */
export class ShippingService {
  // Shipping rates by region
  private static rates: ShippingRate[] = [
    // Pakistan
    {
      region: "Pakistan",
      country: "PK",
      baseRate: 500, // PKR
      perKgRate: 100,
      estimatedDays: "2-5 business days",
    },
    // Middle East
    {
      region: "Middle East",
      country: "AE",
      baseRate: 50, // USD
      perKgRate: 15,
      estimatedDays: "5-10 business days",
    },
    {
      region: "Middle East",
      country: "SA",
      baseRate: 50,
      perKgRate: 15,
      estimatedDays: "5-10 business days",
    },
    // Europe
    {
      region: "Europe",
      country: "GB",
      baseRate: 75,
      perKgRate: 20,
      estimatedDays: "7-14 business days",
    },
    {
      region: "Europe",
      country: "DE",
      baseRate: 75,
      perKgRate: 20,
      estimatedDays: "7-14 business days",
    },
    {
      region: "Europe",
      country: "FR",
      baseRate: 75,
      perKgRate: 20,
      estimatedDays: "7-14 business days",
    },
    // North America
    {
      region: "North America",
      country: "US",
      baseRate: 100,
      perKgRate: 25,
      estimatedDays: "10-20 business days",
    },
    {
      region: "North America",
      country: "CA",
      baseRate: 100,
      perKgRate: 25,
      estimatedDays: "10-20 business days",
    },
    // Rest of World (default)
    {
      region: "International",
      country: "OTHER",
      baseRate: 150,
      perKgRate: 30,
      estimatedDays: "15-30 business days",
    },
  ];

  static calculateShipping(countryCode: string, weightKg: number = 5): number {
    const rate = this.rates.find((r) => r.country === countryCode) ||
                 this.rates.find((r) => r.country === "OTHER")!;

    return rate.baseRate + rate.perKgRate * weightKg;
  }

  static getShippingInfo(countryCode: string): ShippingRate | undefined {
    return this.rates.find((r) => r.country === countryCode) ||
           this.rates.find((r) => r.country === "OTHER");
  }

  static getSupportedRegions(): string[] {
    return Array.from(new Set(this.rates.map((r) => r.region)));
  }

  static getCountriesByRegion(region: string): ShippingRate[] {
    return this.rates.filter((r) => r.region === region);
  }

  /**
   * Estimate shipping for cart
   */
  static estimateCartShipping(
    items: { weight?: number }[],
    countryCode: string
  ): { cost: number; estimatedDays: string; region: string } {
    // Assume average carpet weight if not specified
    const averageWeight = 5; // kg
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || averageWeight), 0);

    const shippingInfo = this.getShippingInfo(countryCode);
    const cost = this.calculateShipping(countryCode, totalWeight);

    return {
      cost,
      estimatedDays: shippingInfo?.estimatedDays || "15-30 business days",
      region: shippingInfo?.region || "International",
    };
  }
}
