<template>
  <ui-select
    :model-value="$route.params.id"
    placeholder="Recent projects"
    class="w-full mb-4"
    @change="changeRoute($event)"
  >
    <option v-for="project in projects" :key="project.id" :value="project.id">
      {{ project.name }}
    </option>
  </ui-select>
  <ui-list class="space-y-1 text-gray-200">
    <ui-list-item
      v-for="item in items"
      :key="item.id"
      :active="item.id === $route.name"
      :to="`/project/${$route.params.id}/${item.path}`"
      tag="router-link"
    >
      <v-mdi :name="item.icon" class="mr-2"></v-mdi>
      <span>{{ item.name }}</span>
    </ui-list-item>
  </ui-list>
</template>
<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Project from '@/models/project';

export default {
  setup() {
    const items = [
      {
        name: 'Packages',
        id: 'project-packages',
        icon: 'mdi-puzzle-outline',
        path: '',
      },
      {
        name: 'Scripts',
        id: 'project-id-scripts',
        icon: 'mdi-clipboard-text-outline',
        path: 'scripts',
      },
      {
        name: 'Boards',
        id: 'project-id-boards',
        icon: 'mdi-view-dashboard-outline',
        path: 'boards',
      },
    ];
    const router = useRouter();

    const projects = computed(() =>
      Project.query().orderBy('createdAt', 'desc').get()
    );

    function changeRoute(id) {
      router.push({ params: { id } });
    }

    return {
      items,
      projects,
      changeRoute,
    };
  },
};
</script>
