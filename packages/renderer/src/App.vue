<template>
  <div class="flex pb-6 h-screen">
    <app-sidebar class="flex-shrink-0"></app-sidebar>
    <main class="overflow-auto h-full flex-1 scroll">
      <router-view />
    </main>
  </div>
  <app-bottom-menu></app-bottom-menu>
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
