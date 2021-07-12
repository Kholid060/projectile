import { app, BrowserWindow, dialog, shell } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { ipcMain } from 'electron-better-ipc';
import gitconfig from 'gitconfiglocal';
import fetch from 'node-fetch';
import { userStore } from './lib/electron-store';
import * as terminalHandler from './utils/terminal/terminalHandler';

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

app.disableHardwareAcceleration();
app.allowRendererProcessReuse = false;

/**
 * Workaround for TypeScript bug
 * @see https://github.com/microsoft/TypeScript/issues/41468#issuecomment-727543400
 */
const env = import.meta.env;


// Install "Vue.js devtools"
if (env.MODE === 'development') {
  app.whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({default: installExtension, VUEJS3_DEVTOOLS}) => installExtension(VUEJS3_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    }))
    .catch(e => console.error('Failed install extension:', e));
}

let mainWindow = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    width: 1080,
    height: 600,
    webPreferences: {
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      enableRemoteModule: env.MODE === 'test', // Spectron tests can't work with enableRemoteModule: false
    },
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();

    if (env.MODE === 'development') {
      mainWindow?.webContents.openDevTools();
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.setMenuBarVisibility(false);
  });

  if (env.MODE === 'production') {
    mainWindow?.webContents.on('new-window', (event, url) => {
      event.preventDefault();

      shell.openExternal(url);
    });
  }

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl = env.MODE === 'development'
    ? env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();


  await mainWindow.loadURL(pageUrl);
};


app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function getPackageJSON(path) {
  const packageJSONPath = join(path, 'package.json');
  const packageJSON = JSON.parse(await readFile(packageJSONPath));

  return packageJSON;
}

ipcMain.answerRenderer('select-dir', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });

    if (canceled) return { canceled };

    const packageJSON = await getPackageJSON(filePaths[0]);

    return { path: filePaths[0], config: packageJSON };
  } catch (error) {
    throw new Error('Can\'t find package.json file');
  }
});
ipcMain.answerRenderer('fetch-npm-registry', async (path) => {
  try {
    const response = await fetch(`https://registry.npmjs.org${path}`);
    const result = await response.json();

    return result;
  } catch (error) {
    throw new Error(error);
  }
});
ipcMain.answerRenderer('get-packageJSON', (path) => getPackageJSON(path));
ipcMain.answerRenderer('get-repository', (path) => {
  return new Promise((resolve) => {
    gitconfig(path, (err, config) => {
      if (err) return resolve('');

      const repository = config.remote?.origin?.url ?? '';

      resolve(repository.replace(/\.git$/, ''));
    });
  });
});
ipcMain.answerRenderer('get-package-manager', async (path) => {
  const pkgManagers = [
    { name: 'yarn', file: 'yarn.lock' },
    { name: 'npm', file: 'package-lock.json' },
    { name: 'pnpm', file: 'pnpm-lock.yaml' },
  ];

  for (let index = 0; index < pkgManagers.length; index++) {
    const { file, name } = pkgManagers[index];
    const filePath = join(path, file);

    if (existsSync(filePath)) return name;
  }

  return 'npm';
});
ipcMain.answerRenderer('run-script', (options) => terminalHandler.runScript(options, mainWindow));
ipcMain.answerRenderer('create-terminal', (options) => terminalHandler.createTerminal(options, mainWindow));

ipcMain.answerRenderer('clean-terminals', terminalHandler.cleanTerminals);
ipcMain.answerRenderer('write-terminal', terminalHandler.writeTerminal);
ipcMain.answerRenderer('remove-terminal', terminalHandler.removeTerminal);
ipcMain.answerRenderer('log-terminal', terminalHandler.logTerminal);
ipcMain.answerRenderer('kill-terminal', terminalHandler.killTerminal);
ipcMain.answerRenderer('remove-project-terminals', terminalHandler.removeProjectTerminals);

ipcMain.answerRenderer('storage-get', ({ key, def }) => userStore.get(key, def));
ipcMain.answerRenderer('storage-set', ({ key, value }) => userStore.set(key, value));
ipcMain.answerRenderer('storage-delete', (key) => userStore.delete(key));
ipcMain.answerRenderer('storage-has', (key) => userStore.has(key));
ipcMain.answerRenderer('storage-clear', () => userStore.clear());

app.whenReady()
  .then(createWindow)
  .catch((e) => console.error('Failed create window:', e));


// Auto-updates
if (env.PROD) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}

