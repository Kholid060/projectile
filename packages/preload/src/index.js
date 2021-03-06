/* eslint-disable no-undef */
import { contextBridge } from 'electron';
import { ipcRenderer } from 'electron-better-ipc';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { join } from 'path';

const apiKey = 'electron';
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const api = {
  path: { join },
  existsSync,
  ipcRenderer,
  homedir: homedir(),
  versions: process.versions,
};

if (import.meta.env.MODE !== 'test') {
  /**
   * The "Main World" is the JavaScript context that your main renderer code runs in.
   * By default, the page you load in your renderer executes code in this world.
   *
   * @see https://www.electronjs.org/docs/api/context-bridge
   */
  contextBridge.exposeInMainWorld(apiKey, api);
} else {

  /**
   * Recursively Object.freeze() on objects and functions
   * @see https://github.com/substack/deep-freeze
   * @param obj Object on which to lock the attributes
   */
  const deepFreeze = (obj) => {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((prop) => {
        const val = obj[prop];
        if ((typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
          deepFreeze(val);
        }
      });
    }

    return Object.freeze(obj);
  };

  deepFreeze(api);

  window[apiKey] = api;

  // Need for Spectron tests
  window.electronRequire = require;
}
