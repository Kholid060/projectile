import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import { readFile } from 'fs/promises';
import gitconfig from 'gitconfiglocal';
import store from './lib/electron-store';

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

app.disableHardwareAcceleration();

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
    webPreferences: {
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      contextIsolation: env.MODE !== 'test',   // Spectron tests can't work with contextIsolation: true
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

function getRepository(path) {
  return new Promise((resolve) => {
    gitconfig(path, (err, config) => {
      if (err) return resolve('');

      const repository = config.remote?.origin?.url ?? '';

      resolve(repository.replace(/\.git$/, ''));
    });
  });
}

ipcMain.handle('select-dir', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });

    if (canceled) return { canceled };

    const packageJSONPath = join(filePaths[0], 'package.json');
    const packageJSON = JSON.parse(await readFile(packageJSONPath));

    return { path: filePaths[0], config: packageJSON };
  } catch (error) {
    throw new Error('Can\'t find package.json file');
  }
});
ipcMain.handle('get-repository', (event, path) => getRepository(path));
ipcMain.handle('storage-get', (event, { key, def }) => Promise.resolve(store.get(key, def)));
ipcMain.handle('storage-set', (event, { key, value }) => Promise.resolve(store.set(key, value)));
ipcMain.handle('storage-delete', (event, key) => Promise.resolve(store.delete(key)));
ipcMain.handle('storage-has', (event, key) => Promise.resolve(store.has(key)));
ipcMain.handle('storage-clear', () => Promise.resolve(store.clear()));

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

