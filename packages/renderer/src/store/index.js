import { createStore } from 'vuex';
import merge from 'deepmerge';
import VuexORM from '@/lib/vuex-orm';
import * as models from '@/models';
import { useStorage } from '@/composable/storage';

const storage = useStorage();

const store = new createStore({
  plugins: [VuexORM(models)],
  state: () => ({
    currentQueue: '',
    packagesQueue: [],
    activeWorkspace: '',
  }),
  getters: {
    isInQueue: (state) => (id) => {
      const isInQueue = state.packagesQueue.some((pkg) => {
        if (pkg.isBatch) return pkg.ids.some((pkgId) => pkgId === id);

        return pkg.id === id;
      });

      return isInQueue;
    },
  },
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
      } else {
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
      }

      localStorage.setItem(
        'packages-queue',
        JSON.stringify(state.packagesQueue)
      );
    },
    nextPackageQueue({ dispatch, state, commit }) {
      if (state.currentQueue) {
        dispatch('packagesQueue', {
          type: 'delete',
          id: state.currentQueue,
        });
      }

      commit('updateState', {
        key: 'currentQueue',
        value:
          state.packagesQueue.length === 0 ? '' : state.packagesQueue[0].id,
      });
    },
    async retrieve() {
      const keys = ['projects', 'boards', 'cards'];

      for (const key of keys) {
        const data = await storage.get(key, []);

        models[key.slice(0, -1)].create({ data });
      }
    },
    saveToStorage({ getters }, key) {
      return new Promise((resolve, reject) => {
        if (!key) {
          reject('You need to pass an entity name');
          return;
        }
        const data = getters[`entities/${key}/all`]();

        storage.set(key, JSON.parse(JSON.stringify(data))).then(() => {
          resolve();
        });
      });
    },
  },
});

export default store;
