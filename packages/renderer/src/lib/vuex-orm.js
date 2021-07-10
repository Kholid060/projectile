import VuexORM, { Query } from '@vuex-orm/core';

function callback(mdoel, param, entity) {
  this.store.dispatch('saveToStorage', entity);
}

Query.on('afterUpdate', callback);
Query.on('afterDelete', callback);

const database = new VuexORM.Database();

export default function (models) {
  Object.values(models).forEach((model) => {
    database.register(model);
  });

  return VuexORM.install(database);
}
