import { CurrencyRate } from "@/types";

/**
 * Currency Service - Multi-currency support
 * Base currency: USD
 */
export class CurrencyService {
  private static baseCurrency = "USD";

  // Default exchange rates (should be fetched from API in production)
  private static rates: Record<string, CurrencyRate> = {
    USD: { code: "USD", rate: 1, symbol: "$", name: "US Dollar" },
    EUR: { code: "EUR", rate: 0.92, symbol: "€", name: "Euro" },
    GBP: { code: "GBP", rate: 0.79, symbol: "£", name: "British Pound" },
    PKR: { code: "PKR", rate: 278, symbol: "Rs", name: "Pakistani Rupee" },
    AED: { code: "AED", rate: 3.67, symbol: "د.إ", name: "UAE Dirham" },
    SAR: { code: "SAR", rate: 3.75, symbol: "﷼", name: "Saudi Riyal" },
  };

  static getSupportedCurrencies(): CurrencyRate[] {
    return Object.values(this.rates);
  }

  static convert(amount: number, from: string, to: string): number {
    if (from === to) return amount;

    const fromRate = this.rates[from]?.rate || 1;
    const toRate = this.rates[to]?.rate || 1;

    // Convert to base currency first, then to target currency
    const baseAmount = amount / fromRate;
    const convertedAmount = baseAmount * toRate;

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimals
  }

  static formatPrice(amount: number, currency: string): string {
    const currencyInfo = this.rates[currency];
    if (!currencyInfo) return `${amount.toFixed(2)} ${currency}`;

    return `${currencyInfo.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  static getCurrencySymbol(code: string): string {
    return this.rates[code]?.symbol || code;
  }

  /**
   * Fetch latest exchange rates from API
   * You can use services like:
   * - https://exchangerate-api.com/
   * - https://openexchangerates.org/
   * - https://currencylayer.com/
   */
  static async updateRates(): Promise<void> {
    try {
      // TODO: Implement API call to fetch latest rates
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // Update this.rates with fetched data
      console.log("Currency rates updated");
    } catch (error) {
      console.error("Failed to update currency rates:", error);
    }
  }
}
