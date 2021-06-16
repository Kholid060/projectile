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
        class="h-5 w-5"
      ></ui-img>
    </div>
    <div class="flex-1">
      <p>{{ item.name }}</p>
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
    <ui-button v-if="!currentPackage.isLatest" icon class="mr-2">
      <v-mdi name="mdi-download-outline"></v-mdi>
    </ui-button>
    <ui-button icon class="text-red-500">
      <v-mdi name="mdi-delete-outline"></v-mdi>
    </ui-button>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import maxSatisfying from 'semver/ranges/max-satisfying';
import semverLt from 'semver/functions/lt';
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
  },
  emits: ['retrieved'],
  setup(props, { emit }) {
    const intersect = useIntersect();
    const { ipcRenderer } = window.electron;

    const container = ref(null);
    const currentPackage = ref({
      isLatest: true,
      latestVersion: '-',
    });

    function getLatestVersion(currentVersion, versions) {
      if (versions[currentVersion]) {
        return {
          isLatest: true,
          latestVersion: versions[currentVersion],
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

    onMounted(() => {
      intersect.observe(container.value, () => {
        if (props.cache[props.item.name]) {
          currentPackage.value = props.cache[props.item.name];

          return;
        }

        ipcRenderer
          .invoke(
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

            if (Date.now() > cachePackage.lastUpdated + 6.048e8) {
              delete lsCache[props.item.name];
              localStorage.setItem('packages', lsCache);
              return;
            }

            if (cachePackage) {
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
      currentPackage,
    };
  },
};
</script>
