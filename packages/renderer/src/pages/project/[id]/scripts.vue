<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center mb-6">
      <span
        class="h-4 w-4 rounded-full flex-shrink-0 mr-2"
        :class="
          state.status[terminalId] === 'running'
            ? 'bg-green-500'
            : 'bg-gray-500'
        "
      ></span>
      <p class="text-2xl leading-none mr-4 text-overflow font-semibold">
        {{ state.activeScript }}
      </p>
      <div class="flex-grow"></div>
      <p
        v-if="packageJSON.scripts"
        :title="packageJSON?.scripts[state.activeScript]"
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
        style="font-family: 'Jetbrains mono', monospace"
      >
        {{ packageJSON?.scripts[state.activeScript] ?? '' }}
      </p>
    </div>
    <div class="flex h-full items-start">
      <div class="w-64 border rounded-lg mr-8 flex-shrink-0">
        <p class="text-gray-300 mb-3 pt-5 px-5">Scripts</p>
        <ui-list class="px-5 pb-5 max-h-96 overflow-auto scroll space-y-1">
          <ui-list-item
            v-for="(val, name, index) in packageJSON.scripts"
            :key="name"
            :active="name === state.activeScript"
            :title="`${name} (alt+${index + 1})`"
            class="cursor-pointer"
            @click="state.activeScript = name"
          >
            <span
              :class="[
                state.status[generateTerminalId(name)] === 'running'
                  ? 'bg-green-500'
                  : 'bg-gray-500',
              ]"
              class="h-3 w-3 rounded-full mr-2"
            ></span>
            <span class="flex-1 text-overflow">{{ name }}</span>
          </ui-list-item>
        </ui-list>
      </div>
      <div class="flex-1 h-full flex-shrink-0 overflow-auto">
        <ui-button
          class="mr-4"
          :variant="
            state.status[terminalId] === 'running' ? 'danger' : 'primary'
          "
          :disabled="state.activeScript === ''"
          title="Space"
          @click="toggleScript"
        >
          <v-mdi
            :name="
              state.status[terminalId] === 'running'
                ? 'mdi-pause'
                : 'mdi-play-outline'
            "
            class="mr-1 -ml-1"
          ></v-mdi>
          <span>
            {{ state.status[terminalId] === 'running' ? 'Stop' : 'Run' }}
            script
          </span>
        </ui-button>
        <ui-button>
          <v-mdi name="mdi-cog-outline" class="mr-2 -ml-1"></v-mdi>
          <span>Parameter</span>
        </ui-button>
        <div
          ref="container"
          style="
            height: calc(100vh - 175px);
            font-family: 'Jetbrains mono', monospace;
          "
          class="
            flex-1
            bg-[#0e131f]
            w-full
            mt-4
            p-5
            rounded-lg
            overflow-auto
            scroll
            relative
            whitespace-pre
          "
        >
          {{ state.logs }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { watch, reactive, computed, onMounted, onUnmounted, ref } from 'vue';
import Mousetrap from 'mousetrap';
import Project from '@/models/project';

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

    const container = ref(null);
    const state = reactive({
      logs: '',
      status: {},
      parameters: {},
      activeScript: '',
    });

    const terminalId = computed(() => generateTerminalId(state.activeScript));

    const ptyDataListener = ipcRenderer.answerMain(
      'script-pty-data',
      ({ data, name }) => {
        if (name === terminalId.value) {
          state.logs += data;

          setTimeout(() => {
            if (container.value && data.name === terminalId.value) {
              container.value.scrollTop = container.value.scrollHeight + 200;
            }
          }, 100);
        }
      }
    );
    const ptyExitListener = ipcRenderer.answerMain(
      'script-pty-exit',
      ({ name }) => {
        state.status[name] = 'idle';
      }
    );

    function generateTerminalId(name) {
      return `script__${props.project.id}__${name}`;
    }
    function toggleScript() {
      if (state.status[terminalId.value] === 'running') {
        ipcRenderer.callMain('terminal:kill', terminalId.value);
      } else {
        const command = props.packageJSON.scripts[state.activeScript];
        const payload = {
          useChildProcess: true,
          type: 'script',
          name: terminalId.value,
          cwd: props.project.path,
          details: props.project,
          command,
        };

        if (props.project.rootId) {
          const rootProject = Project.find(props.project.rootId);
          payload.details.rootPath = rootProject.path;
        }

        ipcRenderer.callMain('terminal:run-script', payload);

        state.status[terminalId.value] = 'running';

        if (!state.logs) state.logs = command + '\n\n';
      }
    }

    watch(terminalId, (value) => {
      ipcRenderer.callMain('terminal:log', value).then(({ log, status }) => {
        state.logs = '';

        state.logs += log;
        state.status[value] = status;
      });
    });
    watch(
      () => props.packageJSON,
      ({ scripts }) => {
        if (!scripts) return;

        const keys = Object.keys(scripts);
        const promises = Promise.all(
          keys.map((key) => {
            const id = generateTerminalId(key);

            return ipcRenderer
              .callMain('terminal:log', id)
              .then((data) => ({ ...data, id }));
          })
        );

        promises.then((data) => {
          data.forEach(({ status, id }) => {
            state.status[id] = status;
          });
        });

        state.activeScript = keys[0] || '';
      },
      { immediate: true }
    );

    const scriptShortcuts = Array.from(
      { length: 9 },
      (_, index) => `alt+${index + 1}`
    );

    onMounted(() => {
      Mousetrap.bind('space', () => {
        toggleScript();
      });
      Mousetrap.bind(scriptShortcuts, (event, combo) => {
        const scripts = Object.keys(props.packageJSON?.scripts ?? {});
        const index = +combo.substr(4) - 1;
        const script = scripts[index];

        if (script) state.activeScript = script;
      });
    });
    onUnmounted(() => {
      Mousetrap.unbind('space');
      Mousetrap.unbind(scriptShortcuts);
      ptyDataListener();
      ptyExitListener();
    });

    return {
      state,
      container,
      terminalId,
      toggleScript,
      generateTerminalId,
    };
  },
};
</script>
