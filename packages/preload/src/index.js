import { dialog } from 'electron';
import { ipcRenderer } from 'electron-better-ipc';
import { exec } from 'child_process';
import osLocale from 'os-locale';
import storage from './lib/electron-store';
const pty = require('node-pty-prebuilt-multiarch');

const api = {
  pty,
  storage,
  ipcRenderer,
  osLocale: osLocale.sync(),
  childProcess: {
    exec,
  },
};

Object.keys(api).forEach((key) => {
  window[key] = api[key];
});
// /* eslint-disable */
// import { contextBridge, ipcRenderer } from 'electron';

// const apiKey = 'electron';
// /**
//  * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
//  */
// const api = {
//   ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on },
//   versions: process.versions,
// };

// if (import.meta.env.MODE !== 'test') {
//   /**
//    * The "Main World" is the JavaScript context that your main renderer code runs in.
//    * By default, the page you load in your renderer executes code in this world.
//    *
//    * @see https://www.electronjs.org/docs/api/context-bridge
//    */
//   contextBridge.exposeInMainWorld(apiKey, api);
// } else {

//   /**
//    * Recursively Object.freeze() on objects and functions
//    * @see https://github.com/substack/deep-freeze
//    * @param obj Object on which to lock the attributes
//    */
//   const deepFreeze = (obj) => {
//     if (typeof obj === 'object' && obj !== null) {
//       Object.keys(obj).forEach((prop) => {
//         const val = obj[prop];
//         if ((typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
//           deepFreeze(val);
//         }
//       });
//     }

//     return Object.freeze(obj);
//   };

//   deepFreeze(api);

//   window[apiKey] = api;

//   // Need for Spectron tests
//   window.electronRequire = require;
// }
