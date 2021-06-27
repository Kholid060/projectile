<template>
  <div class="packages h-full flex flex-col container">
    <package-nav
      v-model:search="state.search"
      :project="project"
      @addPackage="state.addPackage = true"
    ></package-nav>
    <div class="flex items-start space-x-2 overflow-auto scroll flex-1">
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
    <package-details></package-details>
  </div>
</template>
<route>
{
  name: 'project-packages'
}
</route>
<script>
import { computed, watch, shallowReactive, onUnmounted } from 'vue';
import PackageCard from '@/components/package/PackageCard.vue';
import AddPackageModal from '@/components/package/AddPackageModal.vue';
import PackageDetails from '@/components/package/PackageDetails.vue';
import PackageNav from '@/components/package/PackageNav.vue';

export default {
  components: { PackageCard, AddPackageModal, PackageDetails, PackageNav },
  props: {
    packageJSON: {
      type: Object,
      default: () => ({}),
    },
    project: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const projectFilters = [
      { name: 'All', id: 'all' },
      { name: 'Dependencies', id: 'deps' },
      { name: 'Dev Dependencies', id: 'devDeps' },
    ];

    const state = shallowReactive({
      deps: [],
      search: '',
      devDeps: [],
      addPackage: false,
      activeFilter: 'all',
      packageCache: {},
    });

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
    watch(() => props.packageJSON, (config) => {
      if (!config) return;

      state.deps = convertDeps(config.dependencies || {}, 'deps');
      state.devDeps = convertDeps(config.devDependencies || {}, 'devDeps');
    }, { immediate: true });

    onUnmounted(() => {
      state.packageCache = {};
    });

    return {
      state,
      packages,
      projectFilters,
    };
  },
};
</script>
