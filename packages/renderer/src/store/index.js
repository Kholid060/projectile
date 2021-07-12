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
  }),
  getters: {
    isInQueue: (state) => (id) =>
      state.packagesQueue.some((pkg) => pkg.id === id),
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
    retrieve() {
      const keys = ['projects', 'boards', 'cards'];

      const promises = Promise.allSettled(keys.map(async (key) => {
        const data = await storage.get(key, []);

        return { key, data };
      }));

      promises.then((result) => {
        result.forEach(({ status, value }) => {
          if (status === 'fulfilled') {
            models[value.key.slice(0, -1)].create({ data: value.data });
          }
        });
      });
    },
    saveToStorage({ getters }, key) {
      return new Promise((resolve, reject) => {
        if (!key) {
          reject('You need to pass a entites name');
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
