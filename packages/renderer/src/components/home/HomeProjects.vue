<template>
  <ui-list v-if="listView" class="space-y-1">
    <transition-group-list>
      <ui-list-item
        v-for="project in projects"
        :key="project.id"
        class="group even:bg-gray-100 even:bg-opacity-5 list-transition"
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
        <input
          v-if="project.id === editId"
          v-autofocus
          :value="project.name"
          class="bg-transparent rounded-md px-1 border w-5/12"
          @blur="updateProjectName(project, $event)"
          @keyup.enter="editId = ''"
        />
        <p v-else class="w-5/12 text-overflow">{{ project.name }}</p>
        <p class="flex-1 text-overflow text-gray-300 mx-4">
          {{ project.path }}
        </p>
        <ui-button
          icon
          class="mr-4 hidden group-hover:block"
          @click="editId = project.id"
        >
          <v-mdi name="mdi-pencil-outline"></v-mdi>
        </ui-button>
        <ui-button icon class="text-red-500">
          <v-mdi name="mdi-delete-outline"></v-mdi>
        </ui-button>
      </ui-list-item>
    </transition-group-list>
  </ui-list>
  <div v-else class="grid grid-cols-3 gap-5">
    <transition-group-list>
      <ui-card
        v-for="project in projects"
        :key="project.id"
        hover
        class="list-transition"
      >
        <input
          v-if="project.id === editId"
          v-autofocus
          :value="project.name"
          class="bg-transparent rounded-md px-1 border w-full"
          @blur="updateProjectName(project, $event)"
          @keyup.enter="editId = ''"
        />
        <h4 v-else>{{ project.name }}</h4>
        <p class="mb-4 line-clamp text-gray-300">
          {{ project.path }}
        </p>
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
          <ui-button icon class="mr-2" @click="editId = project.id">
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
import { ref } from 'vue';
import { useStore } from 'vuex';

export default {
  props: {
    projects: {
      type: Array,
      default: () => [],
    },
    listView: Boolean,
  },
  setup() {
    const store = useStore();
    const editId = ref('');

    function updateProject(id, data) {
      store.dispatch('projects/update', { id, data });
    }
    function updateProjectName({ id, name }, { target: { value } }) {
      if (value && name !== value) {
        updateProject(id, { name: value });
      }

      editId.value = '';
    }
    function deleteProject({ id, name }) {
      const confirm = window.confirm(`Are you sure want to delete "${name}"?`);

      if (confirm) store.dispatch('projects/delete', id);
    }

    return {
      editId,
      updateProject,
      deleteProject,
      updateProjectName,
    };
  },
};
</script>
