// Browser polyfills for Node.js globals
import { Buffer } from 'buffer';

(globalThis as any).global = globalThis;
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = globalThis.process || { env: {} };