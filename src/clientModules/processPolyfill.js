// Process polyfill for browser environment
// This fixes the "ql is not defined" error from styled-components

if (typeof window !== 'undefined' && typeof process === 'undefined') {
  window.process = {
    env: {
      NODE_ENV: 'production',
      REACT_APP_SC_ATTR: undefined,
      SC_ATTR: undefined,
      REACT_APP_SC_DISABLE_SPEEDY: undefined,
      SC_DISABLE_SPEEDY: undefined,
    },
  };
}

// Also set global process variable
if (typeof process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'production',
      REACT_APP_SC_ATTR: undefined,
      SC_ATTR: undefined,
      REACT_APP_SC_DISABLE_SPEEDY: undefined,
      SC_DISABLE_SPEEDY: undefined,
    },
  };
}
