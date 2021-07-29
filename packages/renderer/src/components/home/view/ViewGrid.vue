<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
  emits: ['edit', 'update', 'delete'],
};
</script>
