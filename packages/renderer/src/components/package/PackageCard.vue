<template>
  <div
    ref="container"
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
    <div class="p-3 mr-4 rounded-full bg-gray-100 bg-opacity-5">
      <ui-img
        lazy
        :alt="`${item.name} Icon`"
        :src="`https://avatars.dicebear.com/api/identicon/${item.name}.svg`"
        class="h-5 w-5 cursor-pointer"
        @click="showDetails"
      ></ui-img>
    </div>
    <div class="flex-1">
      <p class="cursor-pointer" @click="showDetails">{{ item.name }}</p>
      <p
        class="leading-none text-gray-300 w-40 inline-block text-overflow"
        :title="item.version"
      >
        version: {{ item.version }}
      </p>
      <p
        class="text-gray-300 w-40 inline-block ml-12 text-overflow leading-none"
        :title="currentPackage.latestVersion"
      >
        latest:
        <span
          :class="[
            currentPackage.isLatest ? 'text-blue-500' : 'text-yellow-500',
          ]"
        >
          <v-mdi
            v-if="!currentPackage.isLatest"
            name="mdi-alert-outline"
            size="20"
            style="vertical-align: sub"
          ></v-mdi>
          {{ currentPackage.latestVersion }}
        </span>
      </p>
    </div>
    <ui-spinner
      v-if="$store.getters.isInQueue(generatePkgId())"
      size="22"
    ></ui-spinner>
    <template v-else>
      <ui-button
        v-if="!currentPackage.isLatest"
        v-tooltip="'Install latest version'"
        icon
        class="mr-2"
        @click="updatePackage('install')"
      >
        <v-mdi name="mdi-download-outline"></v-mdi>
      </ui-button>
      <ui-button
        v-tooltip="'Delete package'"
        icon
        class="text-red-500"
        @click="updatePackage('remove')"
      >
        <v-mdi name="mdi-delete-outline"></v-mdi>
      </ui-button>
    </template>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import maxSatisfying from 'semver/ranges/max-satisfying';
import semverLt from 'semver/functions/lt';
import semverValid from 'semver/functions/valid';
import emitter from 'tiny-emitter/instance';
import { useIntersect } from '@/composable/intersect';

export default {
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    cache: {
      type: Object,
      default: () => ({}),
    },
    project: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['retrieved'],
  setup(props, { emit }) {
    const intersect = useIntersect();
    const store = useStore();

    const container = ref(null);
    const currentPackage = ref({
      isLatest: true,
      latestVersion: '-',
    });

    function getLatestVersion(currentVersion, versions) {
      const validVersion = semverValid(currentVersion);

      if (versions[currentVersion] || !validVersion) {
        return {
          isLatest: true,
          latestVersion: !validVersion ? '-' : versions[currentVersion],
        };
      }

      const latestVersion =
        maxSatisfying(Object.values(versions), `>=${currentVersion}`) ||
        currentVersion;
      const isLessThanLatest = semverLt(currentVersion, latestVersion);

      return {
        latestVersion: latestVersion || '-',
        isLatest: currentVersion === latestVersion || !isLessThanLatest,
      };
    }
    function showDetails() {
      emitter.emit('package-details', props.item.name);
    }
    function generatePkgId() {
      return `package__${props.project.id}__${props.item.name}`;
    }
    function updatePackage(type) {
      const validVersion = semverValid(currentPackage.value.latestVersion);

      if (!validVersion && type === 'install') return;

      store.dispatch('packagesQueue', {
        type: 'add',
        data: {
          type,
          id: generatePkgId(),
          name: props.item.name,
          version: validVersion,
          path: props.project.path,
          status: 'idle',
          location: props.item.type,
        },
      });
    }

    onMounted(() => {
      intersect.observe(container.value, () => {
        if (props.cache[props.item.name]) {
          currentPackage.value = props.cache[props.item.name];

          return;
        }

        window.ipcRenderer
          .callMain(
            'fetch-npm-registry',
            `/-/package/${props.item.name}/dist-tags`
          )
          .then((versions) => {
            if (versions.empty) return;

            const currentVersion = props.item.version;

            currentPackage.value = getLatestVersion(currentVersion, versions);

            const lsCache = JSON.parse(localStorage.getItem('packages')) || {};
            localStorage.setItem(
              'packages',
              JSON.stringify({
                ...lsCache,
                [props.item.name]: { ...versions, lastUpdated: Date.now() },
              })
            );

            emit('retrieved', currentPackage.value);
          })
          .catch(() => {
            const lsCache = JSON.parse(localStorage.getItem('packages')) || {};
            const cachePackage = lsCache[props.item.name];
            const isMoreThanAWeek =
              Date.now() > cachePackage?.lastUpdated + 6.048e8;

            if (cachePackage && isMoreThanAWeek) {
              delete lsCache[props.item.name];
              localStorage.setItem('packages', lsCache);
              return;
            }

            if (cachePackage) {
              delete cachePackage.lastUpdated;

              currentPackage.value = getLatestVersion(
                props.item.version,
                cachePackage
              );
            }
          });
      });
    });

    return {
      container,
      showDetails,
      updatePackage,
      generatePkgId,
      currentPackage,
    };
  },
};
</script>
