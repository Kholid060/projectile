<template>
  <ui-modal custom-content @close="cleanUp">
    <div class="bg-gray-800 rounded-lg max-w-xl w-full pb-5">
      <div class="flex items-center p-5">
        <p class="flex-1">Add package</p>
        <v-mdi
          name="mdi-close"
          @click="$emit('update:modelValue', false)"
        ></v-mdi>
      </div>
      <form class="flex items-center px-5 pb-5" @submit.prevent="searchPackage">
        <ui-input
          v-model="state.query"
          autofocus
          class="flex-1 mr-4"
          placeholder="Package name"
          prepend-icon="mdi-magnify"
        >
        </ui-input>
        <ui-button variant="primary" :loading="state.loading">
          Search
        </ui-button>
      </form>
      <div v-if="state.searchResults.total" class="px-5 mb-2 flex items-center">
        <ui-select v-model="state.installOn" placeholder="Install on">
          <option value="deps">Main Dependencies</option>
          <option value="dev-deps">Dev Dependencies</option>
        </ui-select>
        <div class="flex-grow"></div>
        <p>{{ state.searchResults.total }} packages founds</p>
      </div>
      <div
        v-if="state.searchResults.results"
        class="space-y-2 scroll overflow-auto px-5 pb-5"
        style="max-height: calc(100vh - 250px)"
      >
        <div
          v-for="item in state.searchResults.results"
          :key="item.package.name"
          class="
            p-5
            rounded-lg
            border
            hover:bg-gray-100 hover:bg-opacity-5
            transition
            flex
            items-center
          "
        >
          <ui-img
            :src="
              getPackageIcon(item.package.links.repository, item.package.name)
            "
            class="h-10 w-10 rounded-full mr-2 overflow-hidden"
            lazy
          ></ui-img>
          <div class="text-overflow flex-1 mr-4">
            <p class="text-overflow">
              {{ item.package.name }}
              <span class="text-gray-300 text-sm"
                >({{ item.package.version }})</span
              >
            </p>
            <p class="text-overflow text-gray-300">
              {{ item.package.description }}
            </p>
          </div>
          <ui-popover @show="fetchPkgVersions(item.package)">
            <template #trigger>
              <ui-button v-tooltip="'Install package'" icon class="mr-2">
                <v-mdi name="mdi-download-outline"></v-mdi>
              </ui-button>
            </template>
            <div class="w-48">
              <p class="mb-1">Versions</p>
              <template v-if="state.pkgVersion[item.package.name]">
                <div
                  v-if="state.pkgVersion[item.package.name].loading"
                  class="text-center"
                >
                  <ui-spinner></ui-spinner>
                </div>
                <ui-list v-else class="space-y-1 max-h-64 overflow-auto scroll">
                  <ui-list-item
                    v-for="(version, name) in state.pkgVersion[
                      item.package.name
                    ].versions"
                    :key="name"
                    small
                    class="cursor-pointer"
                  >
                    <p class="w-6/12 text-overflow pr-2" :title="name">
                      {{ name }}
                    </p>
                    <p
                      class="text-overflow w-6/12 text-right text-gray-300"
                      :title="version"
                    >
                      {{ version }}
                    </p>
                  </ui-list-item>
                </ui-list>
              </template>
            </div>
          </ui-popover>
          <ui-button
            v-tooltip="'Show details'"
            icon
            @click="packageDetails(item.package.name)"
          >
            <v-mdi name="mdi-information-outline"></v-mdi>
          </ui-button>
        </div>
      </div>
    </div>
  </ui-modal>
</template>
<script>
import { reactive } from 'vue';
import emitter from 'tiny-emitter/instance';
import { getPackageIcon } from '@/utils/helper';

export default {
  setup() {
    const state = reactive({
      query: '',
      loading: false,
      installOn: 'deps',
      searchResults: {},
      pkgVersion: {},
    });

    const { ipcRenderer } = window.electron;

    function searchPackage() {
      if (!state.query || state.loading) return;

      state.loading = true;
      ipcRenderer
        .invoke('fetch-npm-registry', `/-/v1/search?text=${state.query}`)
        .then(({ total, objects }) => {
          state.searchResults = {
            results: objects,
            total: total.toString(),
          };
          state.loading = false;
        })
        .catch((error) => {
          console.error(error);
          state.loading = false;
        });
    }
    function cleanUp() {
      state.query = '';
      state.searchResults = {};
      state.pkgVersion = {};
    }
    function fetchPkgVersions(pkg) {
      const isCacheExist =
        state.pkgVersion[pkg.name] && state.pkgVersion[pkg.name].isSuccess;

      if (isCacheExist) return;

      state.pkgVersion[pkg.name] = { loading: true };

      ipcRenderer
        .invoke('fetch-npm-registry', `/-/package/${pkg.name}/dist-tags`)
        .then((versions) => {
          delete versions.latest;

          state.pkgVersion[pkg.name] = {
            versions: {
              latest: pkg.version,
              ...versions,
            },
            isSuccess: true,
          };
        })
        .catch(() => {
          state.pkgVersion[pkg.name] = {
            versions: {
              latest: pkg.version,
            },
          };
        });
    }
    function packageDetails(name) {
      emitter.emit('package-details', name);
    }

    return {
      state,
      cleanUp,
      searchPackage,
      packageDetails,
      getPackageIcon,
      fetchPkgVersions,
    };
  },
};
</script>
