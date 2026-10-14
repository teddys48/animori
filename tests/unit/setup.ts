// Mock Svelte 5 runes for headless unit tests
if (typeof (globalThis as any).$state === 'undefined') {
  (globalThis as any).$state = (init: any) => init;
}
(globalThis as any).$state.raw = (init: any) => init;

if (typeof (globalThis as any).$derived === 'undefined') {
  (globalThis as any).$derived = (init: any) => init;
  (globalThis as any).$derived.by = (fn: any) => fn();
}

if (typeof (globalThis as any).$effect === 'undefined') {
  (globalThis as any).$effect = () => {};
  (globalThis as any).$effect.root = (fn: any) => fn();
}

class MockLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MockLocalStorage() as any;
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    location: {
      origin: 'http://localhost:5173',
      pathname: '/',
      search: '',
      hash: ''
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    scrollTo: () => {}
  } as any;
}
