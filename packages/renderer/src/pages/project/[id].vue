<template>
  <div class="px-5 pt-5 h-full">
    <!-- <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" v-bind="{ project, packageJSON }" />
      </keep-alive>
    </router-view> -->
    <router-view
      v-if="project && packageJSON"
      v-bind="{ project, packageJSON }"
      @refresh="getPackageJSON"
    ></router-view>
  </div>
</template>
<script>
import { watch, computed, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import Project from '@/models/project';

export default {
  setup() {
    const route = useRoute();

    const packageJSON = shallowRef({});

    const project = computed(() => Project.find(route.params.id));

    function getPackageJSON() {
      if (!project.value) return;

      window.ipcRenderer
        .callMain('get-packageJSON', project.value.path)
        .then((config) => {
          if (!config) return;

          packageJSON.value = config;
        });
    }

    watch(() => route.params.id, getPackageJSON, { immediate: true });

    return {
      project,
      packageJSON,
      getPackageJSON,
    };
  },
};
</script>
