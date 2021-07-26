<template>
  <ui-modal v-model="state.show" custom-content @close="cleanUp">
    <div
      class="
        scroll
        overflow-auto
        mt-2
        max-w-3xl
        bg-gray-800
        px-5
        pb-5
        rounded-lg
        w-full
        package-details
        relative
      "
      style="max-height: calc(100vh - 4rem)"
    >
      <div v-if="state.loading" class="text-center my-4">
        <ui-spinner size="36"></ui-spinner>
      </div>
      <template v-else>
        <div class="flex items-center mb-4 pt-5">
          <ui-img
            :src="pkg.details.icon"
            class="h-10 w-10 rounded-full overflow-hidden"
            :alt="`${pkg.name} icon`"
          ></ui-img>
          <div class="ml-4 flex-1 text-overflow">
            <p class="text-overflow">{{ pkg.name }}</p>
            <p class="text-gray-200 text-overflow">
              {{ pkg.details.description }}
            </p>
          </div>
          <div
            class="ml-4 text-blue-400"
            :title="`${pkg.insight.sum} downloads last month`"
          >
            <v-mdi name="mdi-cloud-download-outline" class="mr-2"></v-mdi>
            <span>{{ pkg.insight.sum }}</span>
          </div>
        </div>
        <div class="flex items-start text-gray-200">
          <div
            class="
              flex-1
              scroll
              pb-1
              mr-4
              overflow-auto
              whitespace-nowrap
              space-x-1
            "
          >
            <span
              v-for="keyword in pkg.details.keywords"
              :key="keyword"
              class="px-2 rounded-md inline-block bg-gray-100 bg-opacity-10"
            >
              {{ keyword }}
            </span>
          </div>
          <a
            v-if="pkg.details.repository"
            :href="pkg.details.repository"
            target="_blank"
            title="Repository"
          >
            <v-mdi name="mdi-github"></v-mdi>
          </a>
          <a
            v-if="pkg.details.homepage"
            :href="pkg.details.homepage"
            target="_blank"
            title="Homepage"
            class="ml-2"
          >
            <v-mdi name="mdi-home"></v-mdi>
          </a>
        </div>
        <ui-tabs
          v-model="state.activeTab"
          class="bg-gray-800 z-50 sticky top-0 mb-4"
        >
          <ui-tab
            v-for="tab in tabs"
            :key="tab"
            :value="tab"
            class="capitalize"
          >
            {{ tab }}
          </ui-tab>
        </ui-tabs>
        <keep-alive>
          <component :is="`details-${state.activeTab}`" :pkg="pkg"></component>
        </keep-alive>
      </template>
    </div>
  </ui-modal>
</template>
<script>
import { shallowReactive, onUnmounted } from 'vue';
import emitter from 'tiny-emitter/instance';
import DetailsReadme from './details/DetailsReadme.vue';
import DetailsInsight from './details/DetailsInsight.vue';
import DetailsVersions from './details/DetailsVersions.vue';
import { getPackageIcon, formatNumber } from '@/utils/helper';

export default {
  components: { DetailsReadme, DetailsVersions, DetailsInsight },
  setup() {
    const tabs = ['readme', 'versions', 'insight'];

    const state = shallowReactive({
      show: false,
      loading: false,
      activeTab: 'readme',
    });
    const pkg = shallowReactive({
      name: '',
      details: {},
      insight: {},
    });

    function getPackageDetails(name) {
      state.show = true;
      state.loading = true;

      pkg.name = name;

      const encodedName = encodeURIComponent(name);
      const promises = [
        window.electron.ipcRenderer.callMain(
          'helper:fetch-npm-registry',
          `/${encodedName}`
        ),
        fetch(
          `https://api.npmjs.org/downloads/range/last-month/${encodedName}`
        ),
      ];

      Promise.allSettled(promises)
        .then(async ([details, insight]) => {
          if (details.status === 'fulfilled') {
            delete details.value.versions;
            delete details.value.users;

            pkg.details = details.value;

            const { repository } = details.value;

            if (repository && repository.url) {
              pkg.details.repository = repository.url
                .replace(/^git\+|\.git$/g, '')
                .replace(/git:/, 'https:');
            }

            pkg.details.icon = getPackageIcon(pkg.details.repository, name);
          }

          if (insight.status === 'fulfilled' && insight.value.ok) {
            const { downloads } = await insight.value.json();

            const sum = downloads.reduce(
              (sum, curr) => sum + curr.downloads,
              0
            );

            pkg.insight = { downloads, sum: formatNumber(sum) };
          }

          state.loading = false;
        })
        .catch((error) => {
          state.loading = false;
          console.error(error);
        });
    }
    function cleanUp() {
      Object.assign(pkg, {
        name: '',
        details: {},
        insight: {},
      });
      state.activeTab = 'readme';
    }

    emitter.on('package-details', getPackageDetails);

    onUnmounted(() => {
      emitter.off('package-details', getPackageDetails);
    });

    return {
      pkg,
      tabs,
      state,
      cleanUp,
      getPackageIcon,
    };
  },
};
</script>
