import store from '../../lib/electron-store';
import Terminal from './terminal';

const terminals = {};

export function createTerminal(options, mainWindow) {
  const terminal = new Terminal(options, mainWindow);

  terminals[options.name] = terminal;

  return options.name;
}

export function runScript(options, mainWindow) {
  let terminal = terminals[options.name];

  if (!terminal) {
    createTerminal(options, mainWindow);
    terminal = terminals[options.name];
  } else {
    terminal.useChildProcess ? terminal.run() : terminal.write(options.command);
  }
}

export function writeTerminal({ name, command }) {
  terminals[name]?.write(command);
}

export function killTerminal(name) {
  const terminal = terminals[name];

  if (terminal) {
    terminal.kill();
  }
}

export async function removeTerminal({ name, clean }) {
  const terminal = terminals[name];

  if (!terminal) return null;

  await terminal.destroy();

  if (clean) terminal.clean();

  delete terminals[name];

  return true;
}

export function removeProjectTerminals(id) {
  Object.keys(terminals).forEach((key) => {
    if (key.includes(id)) removeTerminal({ name: key, clean: true });
  });
}

export async function cleanTerminals() {
  for (const key in terminals) {
    await removeTerminal({ name: key, clean: true });
  }
}

export function logTerminal(id) {
  if (!id) return store.get('terminals', {});

  return store.get(`terminals.${id}`, { log: '', status: 'idle' });
}

store.clear();
