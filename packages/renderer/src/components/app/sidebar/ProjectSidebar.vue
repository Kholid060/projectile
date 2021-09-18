<template>
  <ui-select
    :model-value="rootId || $route.params.id"
    placeholder="Recent projects"
    class="w-full mb-4"
    @change="updateIdParams"
  >
    <option v-for="project in projects" :key="project.id" :value="project.id">
      {{ project.name }}
    </option>
  </ui-select>
  <ui-select
    v-if="workspaces.length !== 0 || $route.query.isWorkspace"
    :model-value="$route.params.id"
    placeholder="Workspaces"
    class="w-full mb-4"
    @change="updateIdParams($event, true)"
  >
    <option :value="rootId || $route.params.id">Workspace root</option>
    <option
      v-for="workspace in workspaces"
      :key="workspace.id"
      :value="workspace.id"
    >
      {{ workspace.name }}
    </option>
  </ui-select>
  <ui-list class="space-y-1 text-gray-200">
    <ui-list-item tag="router-link" to="/" title="Ctrl+Shift+1">
      <v-mdi name="mdi-home-variant-outline" class="mr-2"></v-mdi>
      <span>Home</span>
    </ui-list-item>
    <ui-list-item
      v-for="item in items"
      :key="item.id"
      :active="item.id === $route.name"
      :to="`/project/${$route.params.id}/${item.path}`"
      :title="item.title"
      tag="router-link"
    >
      <v-mdi :name="item.icon" class="mr-2"></v-mdi>
      <span>{{ item.name }}</span>
    </ui-list-item>
  </ui-list>
</template>
<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Mousetrap from 'mousetrap';
import Project from '@/models/project';

export default {
  setup() {
    const items = [
      {
        name: 'Packages',
        id: 'project-packages',
        icon: 'mdi-puzzle-outline',
        path: '',
        title: 'Ctrl+Shift+2',
      },
      {
        name: 'Scripts',
        id: 'project-id-scripts',
        icon: 'mdi-clipboard-text-outline',
        path: 'scripts',
        title: 'Ctrl+Shift+3',
      },
      {
        name: 'Boards',
        id: 'project-id-boards',
        icon: 'mdi-view-dashboard-outline',
        path: 'boards',
        title: 'Ctrl+Shift+4',
      },
    ];

    const route = useRoute();
    const router = useRouter();

    const rootId = ref('');

    const shortcuts = {
      'mod+shift+1': () => router.push('/'),
      'mod+shift+2': () => router.push(`/project/${route.params.id}`),
      'mod+shift+3': () => router.push(`/project/${route.params.id}/scripts`),
      'mod+shift+4': () => router.push(`/project/${route.params.id}/boards`),
    };

    const projects = computed(() =>
      Project.query()
        .where('isMonorepo', false)
        .orderBy('createdAt', 'desc')
        .get()
    );
    const workspaces = computed(() =>
      Project.query()
        .where((item) => item.isMonorepo && item.rootId === rootId.value)
        .orderBy('createdAt', 'desc')
        .get()
    );

    function updateIdParams(id, isWorkspace) {
      if (!isWorkspace) rootId.value = id;

      router.push({ params: { id } });
    }

    onMounted(() => {
      const project = Project.find(route.params.id);

      rootId.value = project.isMonorepo ? project.rootId : route.params.id;

      Mousetrap.bind(Object.keys(shortcuts), (event, combo) => {
        shortcuts[combo]();
      });
    });
    onUnmounted(() => {
      Mousetrap.unbind(Object.keys(shortcuts));
    });

    return {
      items,
      rootId,
      projects,
      workspaces,
      updateIdParams,
    };
  },
};
</script>
