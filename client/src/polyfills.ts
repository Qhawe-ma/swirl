// Browser polyfills for Node.js globals
(globalThis as any).global = globalThis;
(globalThis as any).Buffer = globalThis.Buffer || {};
(globalThis as any).process = globalThis.process || { env: {} };