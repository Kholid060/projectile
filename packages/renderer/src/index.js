import { createApp } from 'vue';
import Toast from 'vue-toastification';
import App from './App.vue';
import router from './router';
import store from './store';
import compsUi from './lib/comps-ui';
import vueMdijs from './lib/vue-mdijs';
import 'vue-toastification/dist/index.css';
import './assets/css/tailwind.css';
import './assets/css/style.css';
import './assets/css/fonts.css';
import './assets/css/tooltip.css';

createApp(App)
  .use(router)
  .use(store)
  .use(compsUi)
  .use(Toast)
  .use(vueMdijs)
  .mount('#app');
