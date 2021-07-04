import { createStore } from 'vuex';
import VuexORM from '@/lib/vuex-orm';
import * as models from '@/models';

const { storage } = window;

const store = new createStore({
  plugins: [VuexORM(models)],
  state: () => ({
    searchQuery: '',
  }),
  mutations: {
    updateState(state, { key, value }) {
      state[key] = value;
    },
  },
  actions: {
    retrieve() {
      const keys = ['projects', 'boards', 'cards'];

      keys.forEach((key) => {
        const data = storage.get(key, []);

        models[key.slice(0, -1)].create({ data });
      });
    },
    saveToStorage({ getters }, key) {
      return new Promise((resolve, reject) => {
        if (!key) {
          reject('You need to pass a entites name');
          return;
        }
        const data = getters[`entities/${key}/all`]();

        storage.set(key, JSON.parse(JSON.stringify(data)));

        resolve();
      });
    },
  },
});

export default store;
