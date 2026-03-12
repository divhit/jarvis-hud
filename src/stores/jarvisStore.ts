import { create } from 'zustand';
import { fetchWeatherData, fetchMarketData, fetchSystemStatus, fetchInboxFromHermes } from '@/lib/api';

interface Email {
  from: string;
  subject: string;
  time: string;
}

interface MarketEntry {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: number[];
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  feelsLike: number;
  uvIndex: number;
  icon: string;
}

interface SystemData {
  cpu: number;
  memory: number;
  network: number;
  status: string;
  uptime: string;
  services: Record<string, string>;
}

interface TranscriptEntry {
  speaker: 'user' | 'jarvis';
  text: string;
  timestamp: Date;
}

interface JarvisState {
  currentTime: Date;
  setCurrentTime: (time: Date) => void;

  weather: WeatherData;
  weatherLoading: boolean;
  weatherError: string | null;
  setWeather: (weather: WeatherData) => void;
  fetchWeather: () => Promise<void>;

  markets: MarketEntry[];
  marketsLoading: boolean;
  marketsLive: boolean; // true when BTC data is live
  setMarkets: (markets: MarketEntry[]) => void;
  fetchMarkets: () => Promise<void>;

  inbox: { unread: number; urgent: number; emails: Email[] };
  inboxLoading: boolean;
  inboxLastSync: string;
  setInbox: (inbox: { unread: number; urgent: number; emails: Email[] }) => void;
  fetchInbox: () => Promise<void>;

  system: SystemData;
  systemLoading: boolean;
  systemOnline: boolean;
  setSystem: (system: SystemData) => void;
  fetchSystem: () => Promise<void>;

  transcript: TranscriptEntry[];
  addTranscript: (speaker: 'user' | 'jarvis', text: string) => void;

  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;

  focusedPanel: string | null;
  focusPanel: (panel: string | null) => void;
}

export const useJarvisStore = create<JarvisState>((set) => {
  // Expose store for testing
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__JARVIS_STORE__ = { getState: () => useJarvisStore.getState() };
  }
  return ({
  currentTime: new Date(),
  setCurrentTime: (time) => set({ currentTime: time }),

  weather: {
    temp: 8,
    condition: 'Partly Cloudy',
    humidity: 72,
    wind: 14,
    feelsLike: 6,
    uvIndex: 3,
    icon: '\u26C5',
  },
  weatherLoading: false,
  weatherError: null,
  setWeather: (weather) => set({ weather }),
  fetchWeather: async () => {
    set({ weatherLoading: true, weatherError: null });
    try {
      const data = await fetchWeatherData();
      set({
        weather: {
          temp: data.temp,
          condition: data.condition,
          humidity: data.humidity,
          wind: data.wind,
          feelsLike: data.feelsLike,
          uvIndex: data.uvIndex,
          icon: data.icon,
        },
        weatherLoading: false,
      });
    } catch {
      set({ weatherLoading: false, weatherError: 'OFFLINE' });
    }
  },

  markets: [
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
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 97842.00,
      change: 2.45,
      history: [95000, 95500, 96200, 96800, 97100, 97500, 97842],
    },
  ],
  marketsLoading: false,
  marketsLive: false,
  setMarkets: (markets) => set({ markets }),
  fetchMarkets: async () => {
    set({ marketsLoading: true });
    try {
      const data = await fetchMarketData();
      set({ markets: data, marketsLoading: false, marketsLive: true });
    } catch {
      set({ marketsLoading: false, marketsLive: false });
    }
  },

  inbox: {
    unread: 3,
    urgent: 1,
    emails: [
      { from: 'Tony Stark', subject: 'Arc Reactor Specs - URGENT', time: '2m ago' },
      { from: 'Pepper Potts', subject: 'Board Meeting Tomorrow', time: '15m ago' },
      { from: 'Nick Fury', subject: 'Avengers Initiative Update', time: '1h ago' },
    ],
  },
  inboxLoading: false,
  inboxLastSync: 'MOCK DATA',
  setInbox: (inbox) => set({ inbox }),
  fetchInbox: async () => {
    set({ inboxLoading: true });
    try {
      const data = await fetchInboxFromHermes();
      set({
        inbox: data,
        inboxLoading: false,
        inboxLastSync: new Date().toLocaleTimeString(),
      });
    } catch {
      set({ inboxLoading: false, inboxLastSync: 'SYNC FAILED' });
    }
  },

  system: {
    cpu: 23,
    memory: 47,
    network: 99,
    status: 'ALL SYSTEMS NOMINAL',
    uptime: '847d 14h 22m',
    services: {},
  },
  systemLoading: false,
  systemOnline: false,
  setSystem: (system) => set({ system }),
  fetchSystem: async () => {
    set({ systemLoading: true });
    try {
      const data = await fetchSystemStatus();
      const allOnline = Object.values(data.services).every(
        (s) => s === 'running' || s === 'polling'
      );
      set({
        system: {
          cpu: 15 + Math.floor(Math.random() * 20),
          memory: 40 + Math.floor(Math.random() * 15),
          network: allOnline ? 99 : 50,
          status: data.status === 'online' ? 'ALL SYSTEMS NOMINAL' : 'SYSTEMS DEGRADED',
          uptime: data.uptime_human,
          services: data.services,
        },
        systemLoading: false,
        systemOnline: true,
      });
    } catch {
      set({ systemLoading: false, systemOnline: false });
    }
  },

  transcript: [
    { speaker: 'jarvis', text: 'Good evening, sir. All systems are online and operational.', timestamp: new Date() },
    { speaker: 'jarvis', text: 'I have prepared your daily briefing. Shall I proceed?', timestamp: new Date() },
  ],
  addTranscript: (speaker, text) =>
    set((state) => ({
      transcript: [...state.transcript, { speaker, text, timestamp: new Date() }],
    })),

  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),

  focusedPanel: null,
  focusPanel: (panel) => {
    set({ focusedPanel: panel });
    // Auto-clear focus after 8 seconds
    if (panel) {
      setTimeout(() => set({ focusedPanel: null }), 8000);
    }
  },
})});
