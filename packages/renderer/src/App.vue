<template>
  <div>
    <app-sidebar class="fixed h-full left-0 top-0"></app-sidebar>
    <main class="pl-64 pb-6 h-screen overflow-auto scroll">
      <router-view />
    </main>
  </div>
  <app-bottom-menu></app-bottom-menu>
  <ui-dialog></ui-dialog>
</template>
<script>
import { useStore } from 'vuex';
import AppBottomMenu from './components/app/AppBottomMenu.vue';
import AppSidebar from './components/app/AppSidebar.vue';

export default {
  components: { AppBottomMenu, AppSidebar },
  setup() {
    const store = useStore();

    store.dispatch('retrieve');
  },
};
</script>
