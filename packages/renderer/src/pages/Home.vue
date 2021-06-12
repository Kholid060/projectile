<template>
  <div class="p-12 container">
    <home-nav></home-nav>
    <p class="text-gray-300 mb-3">Starred Projects</p>
    <!-- <ui-list class="space-y-1">
      <ui-list-item
        v-for="(project, index) in projects"
        :key="project.id"
        class="group even:bg-gray-100 even:bg-opacity-5"
      >
        <ui-button icon @click="updateProject(project.id, { starred: !project.starred })">
          <v-mdi
            :name="project.starred ? 'mdi-star' : 'mdi-star-outline'"
            :class="{ 'text-yellow-500': project.starred }"
          ></v-mdi>
        </ui-button>
        <p class="w-5/12 text-overflow ml-4">{{ project.name }}</p>
        <p class="flex-1 text-overflow text-gray-300 mx-4">{{ project.path }}</p>
        <ui-button icon class="mr-4 hidden group-hover:block">
          <v-mdi name="mdi-pencil-outline"></v-mdi>
        </ui-button>
        <ui-button icon class="text-red-500">
          <v-mdi name="mdi-delete-outline"></v-mdi>
        </ui-button>
      </ui-list-item>
    </ui-list> -->
    <div class="grid grid-cols-3 gap-5">
      <transition-group-list>
        <ui-card
          v-for="project in projects"
          :key="project.id"
          hover
          class="list-transition"
        >
          <input
            v-if="project.id === state.editId"
            v-autofocus
            :value="project.name"
            class="bg-transparent rounded-md px-1 border w-full"
            @blur="updateProjectName(project, $event)"
            @keyup.enter="state.editId = ''"
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
            <ui-button icon class="mr-2" @click="state.editId = project.id">
              <v-mdi name="mdi-pencil-outline"></v-mdi>
            </ui-button>
            <ui-button
              icon
              class="text-red-500"
              @click="deleteProject(project)"
            >
              <v-mdi name="mdi-delete-outline"></v-mdi>
            </ui-button>
          </div>
        </ui-card>
      </transition-group-list>
    </div>
  </div>
</template>
<script>
import { computed, shallowReactive } from 'vue';
import { useStore } from 'vuex';
import HomeNav from '@/components/home/HomeNav.vue';

export default {
  components: { HomeNav },
  setup() {
    const store = useStore();

    const state = shallowReactive({
      editId: '',
    });
    const projects = computed(() => store.getters['projects/all']);

    function updateProject(id, data) {
      store.dispatch('projects/update', { id, data });
    }
    function updateProjectName({ id, name }, { target: { value } }) {
      if (value && name !== value) {
        updateProject(id, { name: value });
      }

      state.editId = '';
    }
    function deleteProject({ id, name }) {
      const confirm = window.confirm(`Are you sure want to delete ${name}?`);

      if (confirm) store.dispatch('projects/delete', id);
    }

    return {
      state,
      projects,
      updateProject,
      deleteProject,
      updateProjectName,
    };
  },
};
</script>
