<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center mb-6">
      <span class="h-4 w-4 rounded-full bg-green-500 flex-shrink-0 mr-2"></span>
      <p class="text-2xl leading-none mr-4 text-overflow font-semibold">
        {{ state.activeScript }}
      </p>
      <div class="flex-grow"></div>
      <p
        class="
          bg-black bg-opacity-20
          text-gray-200
          font-mono
          rounded-md
          text-overflow
          px-4
          py-2
          max-w-2xl
        "
        style="font-family: 'Fira Code', monospace"
      >
        {{ packageJSON?.scripts[state.activeScript] }}
      </p>
    </div>
    <div class="flex h-full items-start">
      <div class="w-64 border rounded-lg mr-8">
        <p class="text-gray-300 mb-3 pt-5 px-5">Scripts</p>
        <ui-list class="px-5 pb-5 max-h-96 overflow-auto scroll space-y-1">
          <ui-list-item
            v-for="(val, name) in packageJSON.scripts"
            :key="name"
            :active="name === state.activeScript"
            class="cursor-pointer"
            @click="state.activeScript = name"
          >
            <span
              v-tooltip="'Idle'"
              class="h-3 w-3 rounded-full bg-gray-500 mr-2"
            ></span>
            <span>{{ name }}</span>
          </ui-list-item>
        </ui-list>
      </div>
      <div class="flex-1 h-full">
        <ui-button variant="primary" class="mr-4" @click="runScript">
          <v-mdi name="mdi-play-outline" class="mr-1 -ml-1"></v-mdi>
          <span>Run script</span>
        </ui-button>
        <ui-button>
          <v-mdi name="mdi-cog-outline" class="mr-2 -ml-1"></v-mdi>
          <span>Parameter</span>
        </ui-button>
        <div
          style="
            height: calc(100vh - 175px);
            font-family: 'Fira Code', monospace;
          "
          class="
            flex-1
            bg-black bg-opacity-20
            w-full
            mt-4
            rounded-lg
            p-5
            relative
            overflow-auto
            scroll
          "
        >
          $lorem =>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { watch, shallowReactive } from 'vue';

export default {
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
    const { ipcRenderer } = window.electron;

    const state = shallowReactive({
      activeScript: '',
    });

    ipcRenderer.on('pty-data', (params) => {
      console.log(params);
    });

    function runScript() {
      const name = `${props.project.name}__${state.activeScript}`;

      ipcRenderer.send('node-pty', {
        name,
        write: props.packageJSON.scripts[state.activeScript],
      });
    }

    watch(
      () => props.packageJSON,
      ({ scripts }) => {
        if (!scripts) return;

        state.activeScript = Object.keys(scripts)[0];
      },
      { immediate: true }
    );

    return {
      state,
      runScript,
    };
  },
};
</script>
