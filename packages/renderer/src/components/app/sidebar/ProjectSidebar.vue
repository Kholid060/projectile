<template>
  <ui-list class="space-y-1">
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
        id: 'project-scripts',
        icon: 'mdi-clipboard-text-outline',
        path: 'scripts',
      },
    ];

    return {
      items,
    };
  },
};
</script>
