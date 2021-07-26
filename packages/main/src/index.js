import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import { ipcMain } from 'electron-better-ipc';
import { userStore } from './lib/electron-store';
import * as helper from './utils/helper';
import * as terminalHandler from './utils/terminal/terminalHandler';
import getWorkspaces from './utils/getWorkspaces';

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

ipcMain.answerRenderer('get:workspaces', getWorkspaces);
ipcMain.answerRenderer('get:repository', helper.getRepository);
ipcMain.answerRenderer('get:package-manager', helper.getPackageManager);

ipcMain.answerRenderer('helper:select-project-directory', helper.selectProjectDirectory);
ipcMain.answerRenderer('helper:fetch-npm-registry', helper.fetchNPMRegistry);
ipcMain.answerRenderer('helper:read-json', helper.readJson);

ipcMain.answerRenderer('terminal:run-script', (options) => terminalHandler.runScript(options, mainWindow));
ipcMain.answerRenderer('terminal:create', (options) => terminalHandler.createTerminal(options, mainWindow));
ipcMain.answerRenderer('terminal:cleans', terminalHandler.cleanTerminals);
ipcMain.answerRenderer('terminal:write', terminalHandler.writeTerminal);
ipcMain.answerRenderer('terminal:remove', terminalHandler.removeTerminal);
ipcMain.answerRenderer('terminal:log', terminalHandler.logTerminal);
ipcMain.answerRenderer('terminal:kill', terminalHandler.killTerminal);
ipcMain.answerRenderer('terminal:remove-project', terminalHandler.removeProjectTerminals);

ipcMain.answerRenderer('storage:get', ({ key, def }) => userStore.get(key, def));
ipcMain.answerRenderer('storage:set', ({ key, value }) => userStore.set(key, value));
ipcMain.answerRenderer('storage:delete', (key) => userStore.delete(key));
ipcMain.answerRenderer('storage:has', (key) => userStore.has(key));
ipcMain.answerRenderer('storage:clear', () => userStore.clear());

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

