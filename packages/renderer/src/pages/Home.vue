<template>
  <div class="p-12 container">
    <home-nav></home-nav>
    <div class="grid grid-cols-3 gap-5">
      <ui-card
        v-for="project in projects"
        :key="project.id"
        tabindex="0"
        class="focus:ring focus:outline-none transition"
      >
        <h4>{{ project.name }}</h4>
        <p class="text-gray-300 h-12 line-clamp">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <div class="flex items-center text-gray-300 mt-2">
          <ui-button icon>
            <v-mdi name="mdi-star-outline"></v-mdi>
          </ui-button>
          <div class="flex-grow"></div>
          <ui-button icon>
            <v-mdi name="mdi-github"></v-mdi>
          </ui-button>
        </div>
      </ui-card>
    </div>
  </div>
</template>
<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import HomeNav from '@/components/home/HomeNav.vue';

export default {
  components: { HomeNav },
  setup() {
    const store = useStore();
    const projects = computed(() => store.getters['projects/all']);

    return {
      projects,
    }
  },
};
</script>
