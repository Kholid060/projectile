<template>
  <div class="flex items-center mb-12">
    <h2 class="text-2xl font-semibold">Projects</h2>
    <div class="flex-grow"></div>
    <ui-input placeholder="Search" prepend-icon="mdi-magnify"></ui-input>
    <ui-button icon class="ml-2">
      <v-mdi name="mdi-filter-outline"></v-mdi>
    </ui-button>
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
  setup() {
    const state = shallowReactive({
      showAddProjectModal: false,
    });

    return {
      state,
    };
  },
};
</script>
