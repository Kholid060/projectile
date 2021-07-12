import Store from 'electron-store';

const scheme = {
  projects: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        path: { type: 'string' },
        repository: { type: 'string' },
        createdAt: {
          type: 'number',
          default: Date.now(),
        },
        starred: {
          type: 'boolean',
          default: false,
        },
      },
    },
  },
  boards: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        projectId: { type: 'string' },
        createdAt: {
          type: 'number',
          default: Date.now(),
        },
      },
    },
  },
  cards: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string' },
        data: { type: 'object' },
        boardId: { type: 'string' },
        description: { type: 'string' },
      },
    },
  },
};

const store = new Store({ scheme });

export default store;
