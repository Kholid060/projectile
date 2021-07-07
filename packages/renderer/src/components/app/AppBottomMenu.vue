<template>
  <div
    class="
      fixed
      h-6
      flex
      items-center
      px-5
      bottom-0
      w-full
      left-0
      bg-gray-1000
      text-gray-300
    "
    :class="{ 'border-t': !state.showTerminals }"
  >
    <v-mdi
      v-tooltip="'Terminals'"
      name="mdi-console"
      size="20"
      class="cursor-pointer focus:outline-none"
      :class="{ 'text-primary': state.showTerminals }"
      @click="state.showTerminals = !state.showTerminals"
    ></v-mdi>
    <bottom-install-packages></bottom-install-packages>
    <div class="flex-grow"></div>
    <v-mdi name="mdi-github" size="20"></v-mdi>
  </div>
  <bottom-terminals v-if="state.showTerminals"></bottom-terminals>
</template>
<script>
import { shallowReactive } from 'vue';
import BottomTerminals from './bottom/BottomTerminals.vue';
import BottomInstallPackages from './bottom/BottomInstallPackages.vue';

export default {
  components: { BottomTerminals, BottomInstallPackages },
  setup() {
    const state = shallowReactive({
      showTerminals: false,
    });

    return {
      state,
    };
  },
};
</script>
