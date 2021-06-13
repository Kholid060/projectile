import { createStore } from 'vuex';
import modules from './modules';

const store = new createStore({
  modules,
  state: () => ({
    searchQuery: '',
  }),
  mutations: {
    updateState(state, { key, value }) {
      state[key] = value;
    },
  },
  actions: {
    retrieve({ dispatch }) {
      dispatch('projects/retrieve');
    },
  },
});

export default store;
