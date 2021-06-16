<template>
  <div class="packages px-5 pt-5 h-full flex flex-col">
    <div class="flex items-center mb-8">
      <div class="flex-1 text-overflow pr-8">
        <h2 class="text-2xl font-semibold text-overflow">{{ project.name }}</h2>
        <p class="text-sm text-gray-300">{{ project.path }}</p>
      </div>
      <ui-input
        v-model="state.search"
        prepend-icon="mdi-magnify"
        placeholder="Search package..."
      ></ui-input>
      <ui-button
        variant="primary"
        icon
        class="ml-4"
        @click="state.addPackage = true"
      >
        <v-mdi name="mdi-plus"></v-mdi>
      </ui-button>
    </div>
    <div class="flex items-start space-x-2 overflow-auto scroll flex-1">
      <!-- <ui-button color="bg-primary bg-opacity-10 text-primary">All</ui-button>
      <ui-button>Dependencies</ui-button>
      <ui-button>Dev Dependencies</ui-button> -->
      <div class="w-64 p-5 border rounded-lg sticky top-0">
        <p class="text-gray-300 mb-3">Filter by</p>
        <ui-list class="space-y-1">
          <ui-list-item
            v-for="filter in projectFilters"
            :key="filter.id"
            :active="state.activeFilter === filter.id"
            class="cursor-pointer list-transition"
            @click="state.activeFilter = filter.id"
          >
            {{ filter.name }}
          </ui-list-item>
        </ui-list>
      </div>
      <div class="flex-1 px-5 space-y-2 pb-5">
        <package-card
          v-for="item in packages"
          :key="item.id"
          :cache="state.packageCache"
          v-bind="{ item }"
          @retrieved="state.packageCache[item.name] = $event"
        ></package-card>
      </div>
    </div>
    <add-package-modal v-model="state.addPackage"></add-package-modal>
  </div>
</template>
<route>
{
  name: 'project-packages'
}
</route>
<script>
import { computed, onMounted, shallowReactive, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import PackageCard from '@/components/package/PackageCard.vue';
import AddPackageModal from '@/components/package/AddPackageModal.vue';

export default {
  components: { PackageCard, AddPackageModal },
  setup() {
    const projectFilters = [
      { name: 'All', id: 'all' },
      { name: 'Dependencies', id: 'deps' },
      { name: 'Dev Dependencies', id: 'devDeps' },
    ];

    const store = useStore();
    const route = useRoute();
    const { ipcRenderer } = window.electron;

    const state = shallowReactive({
      deps: [],
      search: '',
      devDeps: [],
      addPackage: true,
      activeFilter: 'all',
      packageCache: {},
    });

    const project = computed(() =>
      store.getters['projects/get'](route.params.id)
    );
    const packages = computed(() => {
      if (state.activeFilter === 'all')
        return searchFilter([].concat(state.deps, state.devDeps));

      return searchFilter(state[state.activeFilter]);
    });

    function convertDeps(obj, type) {
      return Object.entries(obj).map(([name, version]) => ({
        id: `${name}__${type}`,
        type,
        name,
        version: version.replace(/^[\^~]/, ''),
      }));
    }
    function searchFilter(items) {
      return items.filter(({ name }) =>
        name.toLocaleLowerCase().match(state.search.toLocaleLowerCase())
      );
    }

    onMounted(() => {
      ipcRenderer
        .invoke('get-packageJSON', project.value.path)
        .then((config) => {
          if (!config) return;

          state.deps = convertDeps(config.dependencies || {}, 'deps');
          state.devDeps = convertDeps(config.devDependencies || {}, 'devDeps');
        });
    });
    onUnmounted(() => {
      state.packageCache = {};
      console.log(state.packageCache);
    });

    return {
      state,
      project,
      packages,
      projectFilters,
    };
  },
};
</script>
