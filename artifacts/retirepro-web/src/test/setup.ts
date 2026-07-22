import "@testing-library/jest-dom";

class MockIntersectionObserver {
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
}

class MockResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
vi.stubGlobal("ResizeObserver", MockResizeObserver);
