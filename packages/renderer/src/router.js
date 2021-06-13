import { createRouter, createWebHashHistory } from 'vue-router';
import routes from 'virtual:generated-pages';

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

export default router;
