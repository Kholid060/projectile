import { nanoid } from 'nanoid';
import merge from 'deepmerge';
import { useStorage } from '@/composable/storage';

const storage = useStorage();

export default {
  name: 'projects',
  state: () => ({
    data: {},
  }),
  getters: {
    all: (state) =>
      Object.entries(state.data).map(([id, value]) => ({ id, ...value })),
    home: (state) => {
      const result = { recent: [], starred: [] };

      Object.entries(state.data).forEach(([id, value]) => {
        const data = Object.assign({}, { id }, value);

        if (data.starred) return result.starred.push(data);

        result.recent.push(data);
      });

      result.recent = result.recent.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : 1
      );

      return result;
    },
    get: (state) => (id) => state.data[id] || {},
  },
  mutations: {
    updateState(state, { key, value }) {
      state[key] = value;
    },
    addProject(state, { id, data }) {
      state.data[id] = data;
    },
    updateProject(state, { id, data }) {
      state.data[id] = data;
    },
    deleteProject(state, id) {
      delete state.data[id];
    },
  },
  actions: {
    add({ commit, getters }, data) {
      return new Promise((resolve, reject) => {
        const isFolderExist = getters.all.some(
          ({ path }) => path === data.path
        );

        if (isFolderExist) return reject(`You already added this folder`);

        const id = nanoid();

        data.createdAt = Date.now();

        storage.set(`projects.${id}`, data).then(async () => {
          commit('addProject', { id, data });
          console.log(await storage.get('projects'));
          resolve();
        });
      });
    },
    update({ commit, state }, { id, data }) {
      return new Promise((resolve, reject) => {
        if (!state.data[id]) return reject(`Can't find project with ${id} ID`);

        const payload = merge(state.data[id], data);

        storage.set(`projects.${id}`, payload).then(() => {
          commit('updateProject', { id, data: payload });

          resolve(state.data[id]);
        });
      });
    },
    delete({ commit, state }, projectId) {
      return new Promise((resolve) => {
        commit('deleteProject', projectId);

        storage.set('projects', merge({}, state.data)).then(() => {
          resolve();
        });
      });
    },
    retrieve({ commit }) {
      storage.get('projects', {}).then((projects) => {
        console.log(projects);
        commit('updateState', {
          key: 'data',
          value: projects,
        });
      });
    },
  },
};
