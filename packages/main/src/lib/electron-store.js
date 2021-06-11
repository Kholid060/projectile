import Store from 'electron-store';

const scheme = {
  projects: {
    type: 'object',
    patternProperties: {
      '[A-Za-z0-9_-]': {
        properties: {
          name: { type: 'string' },
          path: { type: 'string' },
          createdAt: {
            type: 'number',
            default: Date.now(),
          },
          starred: {
            type: 'boolean',
            default: false,
          },
        },
        required: ['name', 'path'],
      },
    },
  },
}

const store = new Store({ scheme });

export default store;
