<template>
  <div class="p-5 container">
    <home-nav
      v-model:viewType="state.viewType"
      v-model:search="state.search"
    ></home-nav>
    <div v-if="projects.starred.length !== 0" class="mb-12">
      <p class="text-gray-300 mb-3">Starred</p>
      <home-projects
        :list-view="state.viewType === 'list'"
        :projects="projects.starred"
      ></home-projects>
    </div>
    <div v-if="projects.recent.length !== 0" class="mb-4">
      <p class="text-gray-300 mb-3">Recent</p>
      <home-projects
        :list-view="state.viewType === 'list'"
        :projects="projects.recent"
      ></home-projects>
    </div>
  </div>
</template>
<route>
{
  name: 'home',
}
</route>
<script>
import { computed, shallowReactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import HomeNav from '@/components/home/HomeNav.vue';
import HomeProjects from '@/components/home/HomeProjects.vue';

export default {
  components: { HomeNav, HomeProjects },
  setup() {
    const store = useStore();

    const state = shallowReactive({
      search: '',
      viewType: 'grid',
    });
    const projects = computed(() =>
      filterProjects(store.getters['projects/home'])
    );

    function filterProjects(projects) {
      const filter = ({ name }) =>
        name.toLocaleLowerCase().match(state.search.toLocaleLowerCase());

      return {
        starred: projects.starred.filter(filter),
        recent: projects.recent.filter(filter),
      };
    }

    onMounted(() => {
      state.viewType = localStorage.getItem('view-type') || 'grid';
    });

    return {
      state,
      projects,
    };
  },
};
</script>
