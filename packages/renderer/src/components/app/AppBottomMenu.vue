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
      v-tooltip="'Terminals (Ctrl+`)'"
      name="mdi-console"
      size="20"
      class="cursor-pointer focus:outline-none"
      :class="{ 'text-primary': state.showTerminals }"
      @click="state.showTerminals = !state.showTerminals"
    ></v-mdi>
    <bottom-packages-queue></bottom-packages-queue>
    <div class="flex-grow"></div>
    <span
      class="mr-4 text-gray-400 text-sm cursor-pointer"
      @click="state.showAbout = true"
    >
      v{{ state.version }}
    </span>
    <a
      href="https://github.com/Kholid060/projectile"
      target="_blank"
      title="Projectile repository"
    >
      <v-mdi name="mdi-github" size="20"></v-mdi>
    </a>
  </div>
  <bottom-terminals
    v-if="state.showTerminals"
    @close="state.showTerminals = false"
    @show="state.showTerminals = true"
  ></bottom-terminals>
  <ui-modal v-model="state.showAbout" custom-content>
    <bottom-about v-bind="{ name: state.name, version: state.version }" />
  </ui-modal>
</template>
<script>
import { shallowReactive } from 'vue';
import Mousetrap from 'mousetrap';
import BottomAbout from './bottom/BottomAbout.vue';
import BottomTerminals from './bottom/BottomTerminals.vue';
import BottomPackagesQueue from './bottom/BottomPackagesQueue.vue';

export default {
  components: { BottomAbout, BottomTerminals, BottomPackagesQueue },
  setup() {
    const state = shallowReactive({
      showAbout: false,
      version: '0.0.0',
      name: 'Projectile',
      showTerminals: false,
    });

    Mousetrap.bind('mod+`', () => {
      state.showTerminals = !state.showTerminals;
    });

    window.electron.ipcRenderer
      .callMain('app:info')
      .then(({ name, version }) => {
        state.name = name;
        state.version = version;
      });

    return {
      state,
    };
  },
};
</script>
