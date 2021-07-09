<template>
  <div class="container flex flex-col h-full">
    <home-nav
      v-model:viewType="state.viewType"
      v-model:search="state.search"
    ></home-nav>
    <div class="flex-1 overflow-auto scroll pb-5 px-5">
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
  </div>
</template>
<route>
{
  name: 'home',
}
</route>
<script>
import { computed, shallowReactive, onMounted } from 'vue';
import Project from '@/models/project';
import HomeNav from '@/components/home/HomeNav.vue';
import HomeProjects from '@/components/home/HomeProjects.vue';

export default {
  components: { HomeNav, HomeProjects },
  setup() {
    const state = shallowReactive({
      search: '',
      viewType: 'list',
    });
    const projects = computed(() => {
      const projects = Project.query()
        .where(({ name }) =>
          name.toLocaleLowerCase().includes(state.search.toLocaleLowerCase())
        )
        .orderBy('createdAt', 'desc')
        .get();
      const filteredProjects = filterProjects(projects);

      return filteredProjects;
    });

    function filterProjects(projects) {
      const result = {
        recent: [],
        starred: [],
      };

      projects.forEach((project) => {
        result[project.starred ? 'starred' : 'recent'].push(project);
      });

      return result;
    }

    onMounted(() => {
      state.viewType = localStorage.getItem('view-type') || 'list';
    });

    return {
      state,
      projects,
    };
  },
};
</script>
