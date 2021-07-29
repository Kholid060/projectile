<template>
  <ui-list class="space-y-1">
    <ui-list-item
      v-for="project in projects"
      :key="project.id"
      class="group even:bg-gray-500 even:bg-opacity-5"
    >
      <ui-button
        class="mr-4"
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
      <router-link :to="`/project/${project.id}`" class="w-5/12 text-overflow">
        {{ project.name }}
      </router-link>
      <router-link
        :to="`/project/${project.id}`"
        class="flex-1 text-overflow text-gray-300 mx-4"
      >
        {{ project.path }}
      </router-link>
      <v-mdi
        v-if="!project.isPathExist"
        v-tooltip="'Project directory is not found'"
        name="mdi-alert-outline"
        class="mr-4 text-yellow-500 cursor-pointer"
        @click="$emit('selectDir', project)"
      ></v-mdi>
      <ui-button
        icon
        class="mr-4 hidden group-hover:block"
        @click="$emit('edit', project)"
      >
        <v-mdi name="mdi-pencil-outline"></v-mdi>
      </ui-button>
      <ui-button icon class="text-red-500" @click="$emit('delete', project)">
        <v-mdi name="mdi-delete-outline"></v-mdi>
      </ui-button>
    </ui-list-item>
  </ui-list>
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
