import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import compsUi from './lib/comps-ui';
import vueMdijs from './lib/vue-mdijs';
import './assets/css/tailwind.css';
import './assets/css/style.css';
import './assets/css/fonts.css';

createApp(App).use(router).use(compsUi).use(vueMdijs).mount('#app');
