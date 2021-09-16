<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    <transition-group-list>
      <ui-card
        v-for="project in projects"
        :key="project.id"
        :data-project-id="project.id"
        :data-project-name="project.name"
        class="list-transition hover:ring-2 hover:ring-gray-700 project-card"
      >
        <router-link :to="`/project/${project.id}`" class="block text-overflow">
          {{ project.name }}
        </router-link>
        <router-link
          :to="`/project/${project.id}`"
          :title="project.path"
          class="mb-4 text-overflow block text-gray-300"
        >
          {{ project.path }}
        </router-link>
        <div class="flex items-center text-gray-300 mt-2">
          <ui-button
            icon
            @click="
              $emit('update', {
                id: project.id,
                data: { starred: !project.starred },
              })
            "
          >
            <v-mdi
              :name="project.starred ? 'mdi-star' : 'mdi-star-outline'"
              :class="{ 'text-yellow-500': project.starred }"
            ></v-mdi>
          </ui-button>
          <v-mdi
            v-if="!project.isPathExist"
            v-tooltip="'Project directory is not found'"
            name="mdi-alert-outline"
            class="ml-2 focus:outline-none text-yellow-500 cursor-pointer"
            @click="$emit('selectDir', project)"
          ></v-mdi>
          <div class="flex-grow"></div>
          <ui-button icon class="mr-2" @click="$emit('edit', project)">
            <v-mdi name="mdi-pencil-outline"></v-mdi>
          </ui-button>
          <ui-button
            icon
            class="text-red-500"
            @click="$emit('delete', project)"
          >
            <v-mdi name="mdi-delete-outline"></v-mdi>
          </ui-button>
        </div>
      </ui-card>
    </transition-group-list>
  </div>
</template>
<script>
export default {
  props: {
    projects: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['edit', 'update', 'delete', 'selectDir'],
};
</script>
