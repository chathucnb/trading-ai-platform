/**
 * Finnhub News API client.
 * Free tier: 60 calls/min. Provides forex + crypto + general market news.
 */

export interface FinnhubArticle {
  id: number;
  category: string;
  datetime: number;        // unix timestamp (seconds)
  headline: string;
  image: string;
  related: string;         // comma-separated tickers
  source: string;
  summary: string;
  url: string;
}

const BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubNewsClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`Finnhub HTTP ${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  }

  /** Fetch general market news by category */
  async getMarketNews(category: 'forex' | 'crypto' | 'general' | 'merger' = 'general'): Promise<FinnhubArticle[]> {
    const url = `${BASE_URL}/news?category=${category}&token=${this.apiKey}`;
    return this.fetchJson<FinnhubArticle[]>(url);
  }

  /** Fetch company/symbol-specific news */
  async getSymbolNews(symbol: string, fromDate: string, toDate: string): Promise<FinnhubArticle[]> {
    const url = `${BASE_URL}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${this.apiKey}`;
    return this.fetchJson<FinnhubArticle[]>(url);
  }

  /** Fetch both forex and crypto news in a single call batch */
  async getAllTradingNews(): Promise<FinnhubArticle[]> {
    const [forexNews, cryptoNews, generalNews] = await Promise.allSettled([
      this.getMarketNews('forex'),
      this.getMarketNews('crypto'),
      this.getMarketNews('general'),
    ]);

    const articles: FinnhubArticle[] = [];
    if (forexNews.status === 'fulfilled') articles.push(...forexNews.value);
    if (cryptoNews.status === 'fulfilled') articles.push(...cryptoNews.value);
    if (generalNews.status === 'fulfilled') articles.push(...generalNews.value);

    // Deduplicate by id
    const seen = new Set<number>();
    return articles.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }
}

// Singleton
let _client: FinnhubNewsClient | null = null;
export function getFinnhubNewsClient(): FinnhubNewsClient {
  if (!_client) {
    const key = process.env.FINNHUB_API_KEY ?? '';
    if (!key) console.warn('[Finnhub] No API key set — set FINNHUB_API_KEY in .env.local');
    _client = new FinnhubNewsClient(key);
  }
  return _client;
}
