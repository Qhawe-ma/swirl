// @solana/web3.js reads process and Buffer off the global object.
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = {
    env: {},
    browser: true,
    version: '',
    versions: { node: '16.0.0' },
    platform: 'browser',
    argv: [],
    cwd: () => '/',
    nextTick: (fn: Function) => setTimeout(fn, 0),
    title: 'browser',
    pid: 1,
    ppid: 1,
    umask: () => 0,
    uptime: () => 0,
    hrtime: () => [0, 0]
  };
}

import { Buffer } from 'buffer';
import assert from 'assert';

(globalThis as any).global = globalThis;
(globalThis as any).Buffer = Buffer;
(globalThis as any).assert = assert;
