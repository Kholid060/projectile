import { nanoid } from 'nanoid';
import { useStorage } from '@/composable/storage';

const storage = useStorage();

export default {
  name: 'projects',
  state: () => ({
    data: {},
  }),
  getters: {
    all: (state) => Object.entries(state.data).map(([id, value]) => ({ id, ...value })),
  },
  mutations: {
    updateState(state, { key, value }) {
      state[key] = value;
    },
    addProject(state, { id, data }) {
      state.data[id] = data;
    }
  },
  actions: {
    add({ commit, getters }, data) {
      return new Promise((resolve, reject) => {
        const isFolderExist = getters.all.some(({ path }) => path === data.path);

        if (isFolderExist) return reject(`You already added this folder`);

        const id = nanoid();

        storage.set('projects', { [id]: data }).then(() => {
          commit('addProject', { id, data });

          resolve();
        });
      });
    },
    retrieve({ commit, getters }) {
      storage.get('projects', {}).then((projects) => {
        commit('updateState', {
          key: 'data',
          value: projects,
        });
      });
    }
  },
}
