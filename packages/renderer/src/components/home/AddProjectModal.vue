<template>
  <ui-modal content-class="max-w-md">
    <template #header>
      <p>Import Project</p>
    </template>
    <div class="flex items-end">
      <ui-input
        label="Select a folder"
        readonly
        class="flex-1 mr-2"
        placeholder="No folder selected"
        :model-value="project.path"
        @click="selectDirectory"
      ></ui-input>
      <ui-button icon @click="selectDirectory">
        <v-mdi name="mdi-folder-open-outline"></v-mdi>
      </ui-button>
    </div>
    <form @submit.prevent="importProject">
      <ui-input
        v-model="project.name"
        label="Project name"
        placeholder="Name"
        class="w-full my-2"
      ></ui-input>
      <ui-button
        class="w-full mt-8"
        variant="primary"
        :disabled="!project.name || !project.path"
      >
        Import Project
      </ui-button>
    </form>
  </ui-modal>
</template>
<script>
import { shallowReactive } from 'vue';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';

export default {
  emits: ['added'],
  setup(props, { emit }) {
    const toast = useToast();
    const store = useStore();

    const project = shallowReactive({
      path: '',
      name: '',
    });

    const { ipcRenderer } = window.electron;

    function selectDirectory() {
      ipcRenderer
        .invoke('select-dir')
        .then(({ canceled, path, config }) => {
          if (canceled) return;

          project.path = path;
          project.name = config.name || path.split('\\').pop();
        })
        .catch((error) => {
          console.error(error);
          toast.error("Can't find package.json");
        });
    }
    function importProject() {
      if (!project.name || !project.path) return;

      const copy = { ...project };

      delete copy.show;

      store
        .dispatch('projects/add', copy)
        .then((result) => {
          emit('added', result);

          project.show = false;
          project.name = project.path = '';
        })
        .catch((error) => {
          console.error(error);
          toast.error(error);
        });
    }

    return {
      project,
      importProject,
      selectDirectory,
    };
  },
};
</script>
