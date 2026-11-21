// MUI's useMediaQuery needs window.matchMedia, which jsdom does not provide.
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      addEventListener: () => {},
      addListener: () => {},
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => {},
      removeListener: () => {},
    }) as MediaQueryList);

// jsdom does not implement ResizeObserver, which table virtualization may use.
global.ResizeObserver =
  global.ResizeObserver ||
  class ResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  };
