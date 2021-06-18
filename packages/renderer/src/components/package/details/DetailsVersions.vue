<template>
  <div class="mb-4">
    <p class="text-lg mb-2 font-semibold">Tags</p>
    <ul class="space-y-1">
      <li
        v-for="(version, tag) in pkg.details['dist-tags']"
        :key="tag"
        class="flex items-end"
      >
        <p>{{ tag }}</p>
        <div class="border-b mb-1 border-gray-700 border-dotted flex-1"></div>
        <p class="text-gray-100">{{ version }}</p>
      </li>
    </ul>
  </div>
  <div>
    <p class="text-lg mb-2 font-semibold">Versions</p>
    <div class="flex mb-2">
      <p>Version</p>
      <div class="border-b mb-1 border-gray-700 border-dotted flex-1"></div>
      <p>Published</p>
    </div>
    <ul class="space-y-1">
      <li
        v-for="item in filteredVersions(pkg.details.time)"
        :key="item.version"
        class="flex items-end"
      >
        <p>{{ item.version }}</p>
        <div class="border-b mb-1 border-gray-700 border-dotted flex-1"></div>
        <p class="text-gray-100">{{ item.time }}</p>
      </li>
    </ul>
  </div>
</template>
<script>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default {
  props: {
    pkg: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    function filteredVersions(versions) {
      const result = Object.entries(versions).reduceRight(
        (acc, [version, time]) => {
          if (['modified', 'created'].includes(version)) return acc;

          acc.push({
            time: dayjs(time).fromNow(),
            version,
          });

          return acc;
        },
        []
      );

      return result;
    }

    return {
      filteredVersions,
    };
  },
};
</script>
