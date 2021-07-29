<template>
  <view-list
    v-if="listView"
    v-bind="{ projects }"
    @edit="editProjectName"
    @update="updateProject($event.id, $event.data)"
    @delete="deleteProject"
    @selectDir="selectProjectDir"
  ></view-list>
  <view-grid
    v-else
    v-bind="{ projects }"
    @edit="editProjectName"
    @update="updateProject($event.id, $event.data)"
    @delete="deleteProject"
    @selectDir="selectProjectDir"
  ></view-grid>
</template>
<script>
import { useToast } from 'vue-toastification';
import { useDialog } from '@/composable/dialog';
import ViewGrid from './view/ViewGrid.vue';
import ViewList from './view/ViewList.vue';
import Project from '@/models/project';

export default {
  components: { ViewGrid, ViewList },
  props: {
    projects: {
      type: Array,
      default: () => [],
    },
    listView: Boolean,
  },
  setup() {
    const toast = useToast();
    const dialog = useDialog();

    function updateProject(id, data) {
      Project.update({
        where: id,
        data,
      });
    }
    function editProjectName({ id, name }) {
      dialog.prompt({
        title: 'Project name',
        label: 'Name',
        input: name,
        onConfirm(value) {
          updateProject(id, { name: value });
        },
      });
    }
    function deleteProject({ id, name }) {
      const confirm = window.confirm(`Are you sure want to delete "${name}"?`);

      if (confirm) Project.delete(id);
    }
    function selectProjectDir(project) {
      window.electron.ipcRenderer
        .callMain('helper:select-project-directory')
        .then(({ path: newPath, canceled }) => {
          if (canceled) return;

          const isDirExists = Project.query()
            .where(({ id, path }) => id !== project.id && path === newPath)
            .exists();

          if (isDirExists) return toast.error('You already add this directory');

          Project.update({
            where: project.id,
            data: {
              path: newPath,
            },
          });
        });
    }

    return {
      updateProject,
      deleteProject,
      editProjectName,
      selectProjectDir,
    };
  },
};
</script>
