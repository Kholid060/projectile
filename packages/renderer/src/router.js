import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './pages/Home.vue';

const routes = [{ path: '/', name: 'Home', component: Home }];

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

export default router;
