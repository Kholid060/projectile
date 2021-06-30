import { createStore } from 'vuex';
import { useStorage } from '@/composable/storage';
import VuexORM from '@/lib/vuex-orm';
import * as models from '@/models';

const storage = useStorage();

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
    async retrieve() {
      const keys = ['projects', 'boards', 'cards'];

      for (const key of keys) {
        const data = await storage.get(key, []);
        console.log(data, key);
        models[key.slice(0, -1)].create({ data });
      }
    },
    saveToStorage({ getters }, key) {
      return new Promise((resolve, reject) => {
        if (!key) return reject('You need to pass a entites name');
        const data = getters[`entities/${key}/all`]();

        storage.set(key, JSON.parse(JSON.stringify(data))).then(resolve);
      });
    },
  },
});

export default store;
