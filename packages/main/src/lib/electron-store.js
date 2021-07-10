import Store from 'electron-store';

const scheme = {
  terminals: {
    type: 'object',
    patternProperties: {
      '[a-zA-Z0-9_:]': {
        type: 'object',
        properties: {
          log: { type: 'string' },
          isKilled: false,
          isRunning: false,
        },
      },
    },
  },
};

const store = new Store({
  scheme,
  watch: true,
  name: 'terminal-log',
  fileExtension: 'log',
});

export default store;
