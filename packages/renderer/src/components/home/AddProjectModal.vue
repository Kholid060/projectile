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
import { ref } from 'vue';
import { nanoid } from 'nanoid';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import Project from '@/models/project';

export default {
  emits: ['added'],
  setup(props, { emit }) {
    const toast = useToast();
    const store = useStore();

    const { ipcRenderer } = window.electron;

    const projectInitVal = { path: '', name: '', repository: '' };
    const project = ref(projectInitVal);

    function selectDirectory() {
      ipcRenderer
        .callMain('helper:select-project-directory')
        .then((newProject) => {
          if (newProject.canceled) return;

          const isDirExists = Project.query()
            .where('path', newProject.path)
            .exists();

          if (isDirExists) return toast.error('You already add this directory');

          project.value = newProject;
        })
        .catch((error) => {
          console.error(error);
          toast.error("Can't find package.json");
        });
    }
    async function importProject() {
      if (!project.value.name || !project.value.path) return;

      try {
        const id = nanoid();
        const projects = [{ ...project.value, id, createdAt: Date.now() }];

        const workspaces = await ipcRenderer.callMain(
          'get:workspaces',
          project.value.path
        );

        workspaces.forEach((workspace) => {
          projects.push({
            ...workspace,
            rootId: id,
            isMonorepo: true,
            repository: projects[0]?.repository ?? '',
          });
        });

        await Project.insert({ data: projects });
        await store.dispatch('saveToStorage', 'projects');

        emit('added');

        project.value = projectInitVal;
      } catch (error) {
        console.error(error);
        toast.error(error.message || error);
      }
    }

    return {
      project,
      importProject,
      selectDirectory,
    };
  },
};
</script>
