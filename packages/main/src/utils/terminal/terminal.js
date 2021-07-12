import { spawn as ptySpawn } from 'node-pty';
import { spawn as cpSpawn } from 'child_process';
import defaultShell from 'default-shell';
import shellEnv from 'shell-env';
import os from 'os';
import osLocale from 'os-locale';
import { ipcMain } from 'electron-better-ipc';
import kill from 'tree-kill';
import { logStore } from '../../lib/electron-store';
import { DataBatcher} from './dataBatcher';

const pathDelimiter = os.platform() === 'win32' ? ';' : ':';
const eventPrefix = (event, prefix) => prefix ? `${prefix}-${event}` : event;

export default class Terminal {
  constructor(options = {}, mainWindow) {
    this.name = options.name;
    this.cwd = options.cwd || process.cwd();
    this.command = options.command;
    this.useChildProcess = options.useChildProcess || false;
    this.args = options.args || [];
    this.type = options.type;
    this.cols = 80;
    this.rows = 30;

    this.mainWindow = mainWindow;
    this.details = options.details || { path: options.cwd };

    this.batcher = new DataBatcher();
    this.pty = null;

    this.isRunning = false;

    this.batcher.on('flush', (data) => {
      const log = logStore.get(`terminals.${this.name}.log`, '');

      logStore.set(`terminals.${this.name}`, {
        log: log + data,
        status: 'running',
      });

      ipcMain.callRenderer(this.mainWindow, eventPrefix('pty-data', this.type), {
        data,
        status: 'running',
        name: this.name,
      });
    });

    this.run();
  }

  run() {
    if (this.isRunning) return;

    this.isRunning = true;

    const env = getPtyEnv(this.details);

    const ptyArgs = this.args.filter((arg) => typeof arg === 'string');
    const ptyOptions = {
      name: this.name,
      cols: this.cols,
      rows: this.rows,
      cwd: this.cwd,
      env,
    };

    this.useChildProcess
      ? this.childProcess(ptyArgs, ptyOptions)
      : this.nodePty(ptyArgs, ptyOptions);
  }

  onData(data) {
    if (!this.isRunning) {
      return;
    }

    this.batcher.write(data);
  }
  onExit() {
    ipcMain.callRenderer(this.mainWindow, eventPrefix('pty-exit', this.type), { name: this.name });
    logStore.set(`terminals.${this.name}.status`, 'idle');

    this.isRunning = false;
  }

  childProcess(args, { cwd, env }) {
    const [command, ...cpArgs] = this.command.split(' ');

    cpArgs.push(...args);

    this.pty = cpSpawn(command, cpArgs, { cwd, env, shell: true });

    this.pty.stdout.on('data', this.onData.bind(this));
    this.pty.stderr.on('data', this.onData.bind(this));
    this.pty.on('close', this.onExit.bind(this));
  }

  nodePty(args, options) {
    this.pty = ptySpawn(defaultShell, args, options);

    this.pty.on('data', this.onData.bind(this));
    this.pty.on('exit', this.onExit.bind(this));
  }

  write(data) {
    if (this.useChildProcess || !this.isRunning) return;

    this.pty.write(data);
  }

  kill() {
    if (!this.isRunning) return;

    this.useChildProcess ? kill(this.pty.pid) : this.pty.kill();
  }

  clean() {
    const logs = logStore.get('terminals', {});

    if (logs[this.name]) {
      delete logs[this.name];

      logStore.set('terminals', logs);
    }
  }

  async destroy() {
    await this.kill();
    this.clean();
  }
}

function getPtyEnv({ name, version, path }) {
  const currentPath = path;
  const env = Object.assign(
    {},
    process.env,
    shellEnv.sync(),
    {
      LANG: `${osLocale.sync().replace(/-/, '_')}.UTF-8`,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      TERM_PROGRAM: name,
      TERM_PROGRAM_VERSION: version,
    },
  );

  if (currentPath) {
    const envPath = env.Path + `${pathDelimiter}${currentPath}\\node_modules\\.bin`;

    env.PATH = envPath;
    env.Path = envPath;
  }

  return env;
}
