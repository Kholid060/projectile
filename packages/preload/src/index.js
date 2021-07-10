import { dialog } from 'electron';
import { ipcRenderer } from 'electron-better-ipc';
import { homedir } from 'os';
import storage from './lib/electron-store';

const api = {
  storage,
  ipcRenderer,
  homedir: homedir(),
};

Object.keys(api).forEach((key) => {
  window[key] = api[key];
});
