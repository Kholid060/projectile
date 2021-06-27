<template>
  <div class="px-5 pt-5 h-full">
    <router-view v-bind="{ project, packageJSON }"></router-view>
  </div>
</template>
<script>
import { watch, computed, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
  setup() {
    const route = useRoute();
    const store = useStore();
    const { ipcRenderer } = window.electron;

    const packageJSON = shallowRef({});

    const project = computed(() =>
      store.getters['projects/get'](route.params.id)
    );

    function getPackageJSON() {
      ipcRenderer
        .invoke('get-packageJSON', project.value.path)
        .then((config) => {
          if (!config) return;

          packageJSON.value = config;
        });
    }

    watch(() => route.params.id, getPackageJSON, { immediate: true });

    return {
      project,
      packageJSON,
    };
  },
};
</script>
