<template>
  <div class="packages h-full flex flex-col container selection-area-container">
    <package-nav
      v-model:search="state.search"
      :project="project"
      @addPackage="state.addPackage = true"
    ></package-nav>
    <selection-area
      class="flex items-start space-x-2 overflow-auto scroll flex-1"
      :on-move="onSelectionMove"
      :on-start="onSelectionStart"
      :on-stop="enableSelection"
      :options="{ selectables: '.selectable' }"
    >
      <div class="w-64 sticky top-0">
        <div class="p-5 border rounded-lg mb-4">
          <p class="text-gray-300 mb-3">Filter by</p>
          <ui-list class="space-y-1">
            <ui-list-item
              v-for="filter in packageFilters"
              :key="filter.id"
              :active="state.activeFilter === filter.id"
              class="cursor-pointer list-transition"
              @click="state.activeFilter = filter.id"
            >
              {{ filter.name }}
            </ui-list-item>
          </ui-list>
        </div>
        <ui-button
          class="w-full mb-2"
          :loading="btnState.updateAll === 'loading'"
          @click="updateAllPackages"
        >
          Update all packages
        </ui-button>
        <ui-button
          v-if="selectedPackages.size > 1"
          :loading="btnState.updateSelected === 'loading'"
          class="w-full"
          @click="updateSelectedPackages"
        >
          Update selected ({{ selectedPackages.size }})
        </ui-button>
        <div class="flex space-x-2"></div>
        <button class="mx-2 mt-4 text-gray-300" @click="$emit('refresh')">
          <v-mdi name="mdi-reload" class="mr-1"></v-mdi>
          Refresh list
        </button>
      </div>
      <div class="flex-1 px-5 space-y-2 pt-2 pb-5">
        <package-card
          v-for="item in packages"
          :key="item.id"
          :cache="state.packageCache"
          :project="project"
          :data-key="item.id"
          :class="{ 'ring-2': selectedPackages.has(item.id) }"
          v-bind="{ item }"
          @retrieved="state.packageCache[item.name] = $event"
        ></package-card>
      </div>
    </selection-area>
    <ui-modal
      v-model="state.addPackage"
      custom-content
      @close="state.addPackage = false"
    >
      <add-package-modal
        :show="state.addPackage"
        @close="state.addPackage = false"
      ></add-package-modal>
    </ui-modal>
    <package-details></package-details>
  </div>
</template>
<route>
{
  name: 'project-packages'
}
</route>
<script>
import {
  computed,
  watch,
  shallowReactive,
  ref,
  onMounted,
  onUnmounted,
} from 'vue';
import { useStore } from 'vuex';
import Mousetrap from 'mousetrap';
import SelectionArea from '@viselect/vue';
import PackageCard from '@/components/package/PackageCard.vue';
import AddPackageModal from '@/components/package/AddPackageModal.vue';
import PackageDetails from '@/components/package/PackageDetails.vue';
import PackageNav from '@/components/package/PackageNav.vue';
import getPkgLatestVersion from '@/utils/getPkgLatestVersion';

export default {
  components: {
    PackageNav,
    PackageCard,
    SelectionArea,
    PackageDetails,
    AddPackageModal,
  },
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
  emits: ['refresh'],
  setup(props) {
    const packageFilters = [
      { name: 'All', id: 'all' },
      { name: 'Dependencies', id: 'deps' },
      { name: 'Dev Dependencies', id: 'devDeps' },
    ];

    const store = useStore();

    const selectedPackages = ref(new Map());
    const btnState = shallowReactive({
      updateAll: 'idle',
      updateSelected: 'idle',
    });
    const state = shallowReactive({
      deps: [],
      search: '',
      devDeps: [],
      packageCache: {},
      addPackage: false,
      activeFilter: 'all',
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

    function onSelectionMove({ store: { changed } }) {
      const extractIds = (els, type) => {
        els.forEach((el) => {
          const packageId = el.dataset.key;

          if (type === 'add') {
            const pkg = packages.value.find(({ id }) => id === packageId);

            selectedPackages.value.set(packageId, pkg);
          } else if (type === 'delete') {
            selectedPackages.value.delete(packageId);
          }
        });
      };

      extractIds(changed.added, 'add');
      extractIds(changed.removed, 'delete');
    }
    function onSelectionStart({ event, selection }) {
      document.body.classList.add('select-none');

      if (!event?.ctrlKey && !event?.metaKey) {
        selection.clearSelection();
        selectedPackages.value.clear();
      }
    }

    function enableSelection() {
      document.body.classList.remove('select-none');
    }
    function generateQueueId(type) {
      return `package__${props.project.id}__${type}`;
    }

    async function updatePackages({ data, type }) {
      const payload = {
        ids: [],
      };
      let isEmpty = true;

      const isPkgOutdated = (pkg, version) => {
        if (!version.isLatest) {
          payload.ids.push(generateQueueId(pkg.name));
          payload[pkg.type] =
            (payload[pkg.type] || '') + `${pkg.name}@${version.latestVersion} `;

          isEmpty = false;
        }
      };

      for (const pkg of data) {
        try {
          const cache = state.packageCache[pkg.name];
          const isPkgInQueue = store.getters.isInQueue(
            generateQueueId(pkg.name)
          );

          if (isPkgInQueue) continue;

          if (cache) {
            isPkgOutdated(pkg, cache);

            continue;
          }

          const { latestVersion } = await getPkgLatestVersion(
            pkg.name,
            pkg.version
          );
          isPkgOutdated(pkg, latestVersion);

          state.packageCache[pkg.name] = latestVersion;
        } catch (error) {
          console.error(error);
        }
      }

      if (isEmpty) return;

      store.dispatch('packagesQueue', {
        type: 'add',
        data: {
          type,
          ...payload,
          action: 'install',
          id: generateQueueId(type),
          path: props.project.path,
          status: 'idle',
          isBatch: true,
        },
      });
    }

    async function updateAllPackages() {
      btnState.updateAll = 'loading';

      await updatePackages({
        data: [].concat(state.deps, state.devDeps),
        type: 'update_all',
      });

      btnState.updateAll = 'idle';
    }
    async function updateSelectedPackages() {
      btnState.updateSelected = 'loading';

      const data = [...selectedPackages.value.entries()].map(([id, value]) => ({
        id,
        ...value,
      }));

      await updatePackages({ data, type: 'update_selected' });

      btnState.updateSelected = 'idle';
      selectedPackages.value.clear();
    }

    watch(
      () => props.packageJSON,
      (config) => {
        if (!config) return;

        selectedPackages.value.clear();
        state.deps = convertDeps(config.dependencies || {}, 'deps');
        state.devDeps = convertDeps(config.devDependencies || {}, 'devDeps');
      },
      { immediate: true }
    );

    onMounted(() => {
      Mousetrap.bind('mod+shift+n', () => {
        state.addPackage = !state.addPackage;
      });
    });
    onUnmounted(() => {
      state.packageCache = {};
      Mousetrap.unbind('mod+shift+n');
      enableSelection();
    });

    return {
      state,
      packages,
      btnState,
      packageFilters,
      onSelectionMove,
      generateQueueId,
      enableSelection,
      selectedPackages,
      onSelectionStart,
      updateAllPackages,
      updateSelectedPackages,
    };
  },
};
</script>
