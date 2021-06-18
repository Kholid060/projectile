const files = import.meta.globEager('./*.store.js');
const modules = {};

Object.values(files).forEach((value) => {
  modules[value.default.name] = {
    namespaced: true,
    ...value.default,
  };
});

export default modules;
