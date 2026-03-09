import type { AppStorage, TestRecord } from '../types';

const STORAGE_KEY = 'schema_check_app_v1';

function load(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage();
    return JSON.parse(raw) as AppStorage;
  } catch {
    return defaultStorage();
  }
}

function save(data: AppStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function defaultStorage(): AppStorage {
  return { childName: '', pin: null, testHistory: [] };
}

export const storage = {
  get(): AppStorage {
    return load();
  },

  setChildName(name: string): void {
    const data = load();
    data.childName = name;
    save(data);
  },

  setPin(pin: string): void {
    const data = load();
    data.pin = pin;
    save(data);
  },

  verifyPin(pin: string): boolean {
    return load().pin === pin;
  },

  hasPin(): boolean {
    return load().pin !== null;
  },

  saveTestRecord(record: TestRecord): void {
    const data = load();
    data.testHistory = [record, ...data.testHistory].slice(0, 100); // keep last 100
    save(data);
  },

  getHistory(): TestRecord[] {
    return load().testHistory;
  },

  clearHistory(): void {
    const data = load();
    data.testHistory = [];
    save(data);
  },
};
