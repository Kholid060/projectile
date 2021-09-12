<template>
  <div class="flex items-center mb-8">
    <div class="flex-1 text-overflow pr-8">
      <h2 class="text-2xl font-semibold text-overflow">{{ project.name }}</h2>
      <p class="text-sm text-gray-300">{{ project.path }}</p>
    </div>
    <ui-input
      :model-value="search"
      prepend-icon="mdi-magnify"
      placeholder="Search package..."
      @change="$emit('update:search', $event)"
    ></ui-input>
    <ui-button
      v-tooltip="'Add package (Ctrl+Shift+N)'"
      variant="primary"
      icon
      class="ml-4"
      @click="$emit('addPackage')"
    >
      <v-mdi name="mdi-plus"></v-mdi>
    </ui-button>
  </div>
</template>
<script>
export default {
  props: {
    search: {
      type: String,
      default: '',
    },
    project: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['search', 'addPackage', 'update:search'],
};
</script>
