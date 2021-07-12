<template>
  <ui-list v-if="listView" class="space-y-1">
    <ui-list-item
      v-for="project in projects"
      :key="project.id"
      class="group even:bg-gray-500 even:bg-opacity-5"
    >
      <ui-button
        class="mr-4"
        icon
        @click="updateProject(project.id, { starred: !project.starred })"
      >
        <v-mdi
          :name="project.starred ? 'mdi-star' : 'mdi-star-outline'"
          :class="{ 'text-yellow-500': project.starred }"
        ></v-mdi>
      </ui-button>
      <router-link :to="`/project/${project.id}`" class="w-5/12 text-overflow">
        {{ project.name }}
      </router-link>
      <router-link
        :to="`/project/${project.id}`"
        class="flex-1 text-overflow text-gray-300 mx-4"
      >
        {{ project.path }}
      </router-link>
      <ui-button
        icon
        class="mr-4 hidden group-hover:block"
        @click="editProjectName(project)"
      >
        <v-mdi name="mdi-pencil-outline"></v-mdi>
      </ui-button>
      <ui-button icon class="text-red-500" @click="deleteProject(project)">
        <v-mdi name="mdi-delete-outline"></v-mdi>
      </ui-button>
    </ui-list-item>
  </ui-list>
  <div v-else class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    <transition-group-list>
      <ui-card
        v-for="project in projects"
        :key="project.id"
        hover
        class="list-transition"
      >
        <router-link :to="`/project/${project.id}`">
          {{ project.name }}
        </router-link>
        <router-link
          :to="`/project/${project.id}`"
          class="mb-4 line-clamp text-gray-300"
        >
          {{ project.path }}
        </router-link>
        <div class="flex items-center text-gray-300 mt-2">
          <ui-button
            icon
            @click="updateProject(project.id, { starred: !project.starred })"
          >
            <v-mdi
              :name="project.starred ? 'mdi-star' : 'mdi-star-outline'"
              :class="{ 'text-yellow-500': project.starred }"
            ></v-mdi>
          </ui-button>
          <div class="flex-grow"></div>
          <ui-button icon class="mr-2" @click="editProjectName(project)">
            <v-mdi name="mdi-pencil-outline"></v-mdi>
          </ui-button>
          <ui-button icon class="text-red-500" @click="deleteProject(project)">
            <v-mdi name="mdi-delete-outline"></v-mdi>
          </ui-button>
        </div>
      </ui-card>
    </transition-group-list>
  </div>
</template>
<script>
import { useDialog } from '@/composable/dialog';
import Project from '@/models/project';

export default {
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
