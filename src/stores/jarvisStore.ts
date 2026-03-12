import { create } from 'zustand';

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
  icon: string;
}

interface SystemData {
  cpu: number;
  memory: number;
  network: number;
  status: string;
  uptime: string;
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
  setWeather: (weather: WeatherData) => void;

  markets: MarketEntry[];
  setMarkets: (markets: MarketEntry[]) => void;

  inbox: { unread: number; urgent: number; emails: Email[] };
  setInbox: (inbox: { unread: number; urgent: number; emails: Email[] }) => void;

  system: SystemData;
  setSystem: (system: SystemData) => void;

  transcript: TranscriptEntry[];
  addTranscript: (speaker: 'user' | 'jarvis', text: string) => void;

  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;
}

export const useJarvisStore = create<JarvisState>((set) => ({
  currentTime: new Date(),
  setCurrentTime: (time) => set({ currentTime: time }),

  weather: {
    temp: 8,
    condition: 'Partly Cloudy',
    humidity: 72,
    wind: 14,
    icon: '\u26C5',
  },
  setWeather: (weather) => set({ weather }),

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
  setMarkets: (markets) => set({ markets }),

  inbox: {
    unread: 3,
    urgent: 1,
    emails: [
      { from: 'Tony Stark', subject: 'Arc Reactor Specs - URGENT', time: '2m ago' },
      { from: 'Pepper Potts', subject: 'Board Meeting Tomorrow', time: '15m ago' },
      { from: 'Nick Fury', subject: 'Avengers Initiative Update', time: '1h ago' },
    ],
  },
  setInbox: (inbox) => set({ inbox }),

  system: {
    cpu: 23,
    memory: 47,
    network: 99,
    status: 'ALL SYSTEMS NOMINAL',
    uptime: '847d 14h 22m',
  },
  setSystem: (system) => set({ system }),

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
}));
