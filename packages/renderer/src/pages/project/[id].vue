<template>
  <div class="px-5 pt-5 h-full">
    <router-view v-bind="{ project, packageJSON }"></router-view>
  </div>
</template>
<script>
import { watch, computed, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import Project from '@/models/project';

export default {
  setup() {
    const route = useRoute();
    const { ipcRenderer } = window.electron;

    const packageJSON = shallowRef({});

    const project = computed(() => Project.find(route.params.id));

    function getPackageJSON() {
      if (!project.value) return;
      console.log(project.value);
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
