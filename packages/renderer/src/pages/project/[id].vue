<template>
  <div class="px-5 pt-5 h-full">
    <router-view
      v-if="project && packageJSON"
      v-bind="{ project, packageJSON }"
      @refresh="getPackageJSON"
    ></router-view>
  </div>
</template>
<script>
import { watch, computed, shallowRef, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import emitter from 'tiny-emitter/instance';
import Project from '@/models/project';

export default {
  setup() {
    const route = useRoute();
    const { ipcRenderer } = window.electron;

    const packageJSON = shallowRef({});

    const project = computed(() => Project.find(route.params.id));

    function getPackageJSON() {
      if (!project.value) return;

      ipcRenderer
        .callMain('get-packageJSON', project.value.path)
        .then((config) => {
          if (!config) return;

          packageJSON.value = config;
        });
    }

    emitter.on('refresh-package-json', getPackageJSON);

    watch(() => route.params.id, getPackageJSON, { immediate: true });

    onUnmounted(() => {
      emitter.off('refresh-package-json', getPackageJSON);
    });

    return {
      project,
      packageJSON,
      getPackageJSON,
    };
  },
};
</script>
