export interface WeatherResponse {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  feelsLike: number;
  uvIndex: number;
  icon: string;
}

export interface MarketEntry {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

export interface SystemStatus {
  status: string;
  uptime_human: string;
  services: Record<string, string>;
}

/**
 * Fetch live weather from the Next.js proxy route (which calls wttr.in)
 */
export async function fetchWeatherData(): Promise<WeatherResponse> {
  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

/**
 * Fetch BTC price from CoinGecko (free, no key needed)
 */
async function fetchBTC(): Promise<MarketEntry> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
  );
  if (!res.ok) throw new Error('CoinGecko fetch failed');
  const data = await res.json();
  const price = data.bitcoin.usd;
  const change = data.bitcoin.usd_24h_change;

  // Generate a synthetic history based on price and change
  const startPrice = price / (1 + change / 100);
  const history = Array.from({ length: 7 }, (_, i) => {
    const progress = i / 6;
    const noise = (Math.random() - 0.5) * price * 0.005;
    return Math.round(startPrice + (price - startPrice) * progress + noise);
  });

  return {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: Math.round(price),
    change: parseFloat(change.toFixed(2)),
    history,
  };
}

/**
 * Fetch market data. BTC is live via CoinGecko.
 * Stock indices use cached estimates (no free client-side API without keys).
 */
export async function fetchMarketData(): Promise<MarketEntry[]> {
  // Fetch BTC live
  let btc: MarketEntry;
  try {
    btc = await fetchBTC();
  } catch {
    btc = {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 0,
      change: 0,
      history: [0, 0, 0, 0, 0, 0, 0],
    };
  }

  // Stock indices — no free browser-safe API without keys
  // These are labeled as CACHED in the UI
  const indices: MarketEntry[] = [
    {
      symbol: 'TSX',
      name: 'S&P/TSX',
      price: 25142.30,
      change: 0.84,
      history: [24800, 24950, 25050, 24900, 25100, 25050, 25142],
    },
    {
      symbol: 'SPX',
      name: 'S&P 500',
      price: 5948.71,
      change: 1.12,
      history: [5850, 5880, 5900, 5870, 5920, 5940, 5948],
    },
    {
      symbol: 'NDX',
      name: 'NASDAQ',
      price: 21025.40,
      change: -0.38,
      history: [21200, 21150, 21100, 21080, 21050, 21040, 21025],
    },
  ];

  return [...indices, btc];
}

/**
 * Fetch system status from Hermes on Fly.io
 */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch('https://hermes-jarvis.fly.dev/status', {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error('System status fetch failed');
  return res.json();
}

/**
 * Fetch inbox from Hermes /sync endpoint (slow, user-triggered only)
 */
export async function fetchInboxFromHermes(): Promise<{
  unread: number;
  urgent: number;
  emails: { from: string; subject: string; time: string }[];
}> {
  const res = await fetch('https://hermes-jarvis.fly.dev/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Check my inbox, return last 3 emails as JSON. Format: {"unread": N, "urgent": N, "emails": [{"from": "Name", "subject": "Subject", "time": "Xm ago"}]}. Return ONLY the JSON, no other text.',
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error('Inbox fetch failed');
  const data = await res.json();

  // Try to parse JSON from the response
  const responseText = typeof data === 'string' ? data : data.response || data.text || JSON.stringify(data);
  const jsonMatch = responseText.match(/\{[\s\S]*"emails"[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Could not parse inbox data');
}
