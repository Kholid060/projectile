<template>
  <view-list
    v-if="listView"
    v-bind="{ projects }"
    @edit="editProjectName"
    @update="updateProject($event.id, $event.data)"
    @delete="deleteProject"
  ></view-list>
  <view-grid
    v-else
    v-bind="{ projects }"
    @edit="editProjectName"
    @update="updateProject($event.id, $event.data)"
    @delete="deleteProject"
  ></view-grid>
</template>
<script>
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

    return {
      updateProject,
      deleteProject,
      editProjectName,
    };
  },
};
</script>
