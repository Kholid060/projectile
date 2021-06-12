import Store from 'electron-store';

const scheme = {
  projects: {
    type: 'object',
    patternProperties: {
      '[A-Za-z0-9_-]': {
        properties: {
          name: { type: 'string' },
          path: { type: 'string' },
          repository: { type: 'string' },
          description: {
            type: 'string',
            default: '',
          },
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
};

const store = new Store({ scheme });
console.log(store.path);
export default store;