<template>
  <p>Package Downloads</p>
  <p class="text-gray-300 leading-tight">{{ date }}</p>
  <div class="flex h-32 justify-evenly items-end mt-6">
    <div
      v-for="item in data"
      :key="item.day"
      v-tooltip:bottom.group="`${item.day}: ${item.downloads}`"
      :style="{ height: item.height }"
      class="
        flex-1
        mx-1
        bg-blue-400
        rounded
        bg-opacity-50
        hover:bg-opacity-60
        transition
        relative
      "
    >
      <span
        class="absolute w-full bg-blue-500 rounded top-0"
        style="height: 12%; min-height: 8px"
      ></span>
    </div>
  </div>
</template>
<script>
import { onMounted, ref, computed } from 'vue';
import dayjs from 'dayjs';
import { useGroupTooltip } from '@/composable/groupTooltip';
import { formatNumber } from '@/utils/helper';

export default {
  props: {
    pkg: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    useGroupTooltip();

    const date = ref('');
    const maxSize = ref(0);
    const data = computed(() => {
      const result = props.pkg.insight.downloads.map(({ downloads, day }) => ({
        downloads: formatNumber(downloads),
        day: dayjs(day).format('DD/MM/YYYY'),
        height: ((downloads / maxSize.value) * 100 + 6).toFixed(2) + '%',
      }));

      return result;
    });

    onMounted(() => {
      const dataLastIndex = props.pkg.insight.downloads.length - 1;

      props.pkg.insight.downloads.forEach(({ downloads, day }, index) => {
        if (downloads > maxSize.value) maxSize.value = downloads;

        if (index === 0 || index === dataLastIndex) {
          const currentDate = dayjs(day).format('DD MMMM YYYY');

          date.value += index === 0 ? currentDate : ` - ${currentDate}`;
        }
      });
    });

    return {
      data,
      date,
    };
  },
};
</script>
