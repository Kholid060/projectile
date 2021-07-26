<template>
  <aside class="w-64 bg-gray-1000 p-5">
    <component :is="activeSidebar"></component>
  </aside>
</template>
<script>
import { watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import ProjectSidebar from './sidebar/ProjectSidebar.vue';
import HomeSidebar from './sidebar/HomeSidebar.vue';

export default {
  components: { ProjectSidebar, HomeSidebar },
  setup() {
    const route = useRoute();

    const activeSidebar = ref('home-sidebar');

    watch(route, (value) => {
      if (value.name.startsWith('project-')) {
        activeSidebar.value = 'project-sidebar';
        return;
      }

      activeSidebar.value = 'home-sidebar';
    });

    return {
      activeSidebar,
    };
  },
};
</script>
