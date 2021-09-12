import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';
import merge from 'deepmerge';
import 'xterm/css/xterm.css';

export const defaultOptions = {
  fontFamily: 'Cascadia Code, monospace',
  theme: {
    background: '#0e131f',
    blue: '#3B82F6',
    brightBlue: '#60A5FA',
    brightCyan: '#22D3EE',
    brightGreen: '#4ADE80',
    brightMagenta: '#E879F9',
    brightRed: '#F87171',
    brightYellow: '#FACC15',
    cyan: '#06B6D4',
    green: '#22C55E',
    magenta: '#D946EF',
    red: '#EF4444',
    yellow: '#EAB308',
  },
};

export default function (el, options = {}) {
  const xtermOptions = merge(defaultOptions, options);
  const terminal = new Terminal(xtermOptions);
  const fitAddon = new FitAddon();

  terminal.loadAddon(new WebLinksAddon());
  terminal.loadAddon(fitAddon);
  terminal.open(el);

  fitAddon.fit();

  Object.assign(terminal, { fitAddon });

  return terminal;
}
