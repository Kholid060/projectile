<template>
  <div class="flex items-center mb-6 p-5">
    <h2 class="text-2xl font-semibold">Projects</h2>
    <div class="flex-grow"></div>
    <ui-input
      :model-value="search"
      placeholder="Search"
      prepend-icon="mdi-magnify"
      @update:modelValue="$emit('update:search', $event)"
    ></ui-input>
    <div class="ml-2 text-gray-300 flex items-center border rounded-lg">
      <ui-button
        v-for="item in viewTypes"
        :key="item.id"
        :class="{ 'text-primary': item.id === viewType }"
        :color="item.id !== viewType ? 'bg-transparent' : ''"
        icon
        @click="updateViewType(item.id)"
      >
        <v-mdi :name="item.icon"></v-mdi>
      </ui-button>
    </div>
    <ui-button
      variant="primary"
      class="ml-2"
      @click="state.showAddProjectModal = true"
    >
      <v-mdi name="mdi-plus" class="mr-1 -ml-2"></v-mdi>
      Project
    </ui-button>
    <add-project-modal
      v-model="state.showAddProjectModal"
      @added="state.showAddProjectModal = false"
    ></add-project-modal>
  </div>
</template>
<script>
import { shallowReactive } from 'vue';
import AddProjectModal from './AddProjectModal.vue';

export default {
  components: { AddProjectModal },
  props: {
    search: {
      type: String,
      default: '',
    },
    viewType: {
      type: String,
      default: 'grid',
    },
  },
  emits: ['update:search', 'update:viewType'],
  setup(props, { emit }) {
    const viewTypes = [
      { id: 'grid', icon: 'mdi-view-grid-outline' },
      { id: 'list', icon: 'mdi-view-list-outline' },
    ];
    const state = shallowReactive({
      showAddProjectModal: false,
    });

    function updateViewType(type) {
      emit('update:viewType', type);
      localStorage.setItem('view-type', type);
    }

    return {
      state,
      viewTypes,
      updateViewType,
    };
  },
};
</script>
