import { createStore } from 'vuex';
import merge from 'deepmerge';
import VuexORM from '@/lib/vuex-orm';
import * as models from '@/models';

const { storage } = window;

const store = new createStore({
  plugins: [VuexORM(models)],
  state: () => ({
    currentQueue: '',
    packagesQueue: [],
  }),
  mutations: {
    updateState(state, { key, value }) {
      state[key] = value;
    },
    addPackagesQueue(state, data) {
      state.packagesQueue.push(data);
    },
    updatePackagesQueue(state, { index, data }) {
      const mergedData = merge(state.packagesQueue[index], data);

      state.packagesQueue[index] = mergedData;
    },
    deletePackagesQueue(state, index) {
      state.packagesQueue.splice(index, 1);
    },
  },
  actions: {
    packagesQueue({ commit, state }, { type, id, data }) {
      if (type === 'add') {
        const isInQueue = state.packagesQueue.some(
          (item) => item.id === data.id
        );

        if (isInQueue) return;

        commit('addPackagesQueue', data);
        return;
      }

      const packageIndex = state.packagesQueue.findIndex(
        (item) => item.id === id
      );

      if (packageIndex !== -1) {
        if (type === 'update') {
          commit('updatePackagesQueue', { index: packageIndex, data });
        }

        if (type === 'delete') {
          commit('deletePackagesQueue', packageIndex);
        }
      }
    },
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
