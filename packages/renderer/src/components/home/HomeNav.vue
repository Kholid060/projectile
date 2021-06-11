<template>
  <div class="flex items-center mb-12">
    <h2 class="text-2xl font-semibold">Projects</h2>
    <div class="flex-grow"></div>
    <ui-input placeholder="Search" prepend-icon="mdi-magnify"></ui-input>
    <ui-button icon class="ml-2">
      <v-mdi name="mdi-filter-outline"></v-mdi>
    </ui-button>
    <ui-button variant="primary" class="ml-2" @click="projectModal.show = true">
      <v-mdi name="mdi-plus" class="mr-1 -ml-2"></v-mdi>
      Project
    </ui-button>
    <ui-modal v-model="projectModal.show" content-class="max-w-md">
      <template #header>
        <p>Import Project</p>
      </template>
      <div class="flex items-end">
        <ui-input
          label="Select a folder"
          readonly
          class="flex-1 mr-2"
          placeholder="No folder selected"
          :model-value="projectModal.path"
          @click="selectDirectory"
        ></ui-input>
        <ui-button icon @click="selectDirectory">
          <v-mdi name="mdi-folder-open-outline"></v-mdi>
        </ui-button>
      </div>
      <form class="mt-4" @submit.prevent="importProject">
        <ui-input
          label="Project name"
          placeholder="Name"
          v-model="projectModal.name"
          class="w-full"
        ></ui-input>
        <ui-button
          class="w-full mt-12"
          variant="primary"
          :disabled="!projectModal.name || !projectModal.path"
        >
          Import Project
        </ui-button>
      </form>
    </ui-modal>
  </div>
</template>
<script>
import { shallowReactive } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';

export default {
  setup() {
    const toast = useToast();
    const store = useStore();

    const projectModal = shallowReactive({
      name: '',
      path: '',
      show: false,
      starred: false,
    });
    const { ipcRenderer } = window.electron;

    function selectDirectory() {
      ipcRenderer.invoke('select-dir').then(({ canceled, path, config }) => {
        if (canceled) return;

        projectModal.path = path;
        projectModal.name = config.name || path.split('\\').pop();
      }).catch((error) => {
        toast.error('Can\'t find package.json');
      });
    }
    function importProject() {
      if (!projectModal.name || !projectModal.path) return;

      const copy = { ...projectModal };

      delete copy.show;

      store.dispatch('projects/add', copy).then(() => {
        projectModal.show = false;
        projectModal.name = projectModal.path = '';
      }).catch((error) => {
        toast.error(error);
      });
    }

    return {
      projectModal,
      importProject,
      selectDirectory,
    };
  }
};
</script>
