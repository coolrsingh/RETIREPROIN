import "@testing-library/jest-dom";

class MockIntersectionObserver {
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
