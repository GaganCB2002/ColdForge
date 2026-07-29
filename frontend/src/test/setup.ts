import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock localStorage
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (index: number) => Object.keys(store)[index] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

// Mock IntersectionObserver (must work as a constructor: new IntersectionObserver(cb, opts))
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: class {
    root: Element | Document | null = null;
    rootMargin: string = '';
    thresholds: ReadonlyArray<number> = [0];
    scrollMargin: any = {};
    constructor(_callback: any, _options?: any) {}
    observe() { }
    unobserve() { }
    disconnect() { }
    takeRecords(): any[] { return []; }
  },
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(globalThis, 'ResizeObserver', { value: MockResizeObserver });

// Mock matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
