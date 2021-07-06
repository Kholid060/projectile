<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center mb-6">
      <span
        class="h-4 w-4 rounded-full flex-shrink-0 mr-2"
        :class="terminal.status === 'running' ? 'bg-green-500' : 'bg-gray-500'"
      ></span>
      <p class="text-2xl leading-none mr-4 text-overflow font-semibold">
        {{ state.activeScript }}
      </p>
      <div class="flex-grow"></div>
      <p
        v-if="packageJSON.scripts"
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
      <div class="w-64 border rounded-lg mr-8 flex-shrink-0">
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
              :class="[
                state.terminals[`${project.id}__${name}`]?.status === 'running'
                  ? 'bg-green-500'
                  : 'bg-gray-500',
              ]"
              class="h-3 w-3 rounded-full mr-2"
            ></span>
            <span>{{ name }}</span>
          </ui-list-item>
        </ui-list>
      </div>
      <div class="flex-1 h-full flex-shrink-0 overflow-auto">
        <ui-button
          class="mr-4"
          :variant="terminal.status === 'running' ? 'danger' : 'primary'"
          @click="toggleScript"
        >
          <v-mdi
            :name="
              terminal.status === 'running' ? 'mdi-pause' : 'mdi-play-outline'
            "
            class="mr-1 -ml-1"
          ></v-mdi>
          <span
            >{{ terminal.status === 'running' ? 'Stop' : 'Run' }} script</span
          >
        </ui-button>
        <ui-button>
          <v-mdi name="mdi-cog-outline" class="mr-2 -ml-1"></v-mdi>
          <span>Parameter</span>
        </ui-button>
        <div
          ref="container"
          style="
            height: calc(100vh - 175px);
            font-family: 'Fira Code', monospace;
          "
          class="
            flex-1
            bg-[#0e131f]
            w-full
            mt-4
            p-5
            rounded-lg
            relative
            overflow-auto
            scroll
            relative
            whitespace-pre
          "
        >
          {{ state.terminals[terminalId]?.log }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { watch, reactive, computed, onMounted, onUnmounted, ref } from 'vue';

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
    const container = ref(null);
    const state = reactive({
      terminals: {},
      activeScript: '',
    });

    const terminalId = computed(
      () => `${props.project.id}__${state.activeScript}`
    );
    const terminal = computed(
      () => state.terminals[terminalId.value] || { status: 'idle', log: '' }
    );

    const ptyDataListener = window.ipcRenderer.answerMain(
      'pty-data',
      ({ data, status, name }) => {
        state.terminals[name].log += data;
        state.terminals[name].status = status;

        setTimeout(() => {
          if (container.value && data.name === terminalId.value) {
            container.value.scrollTop = container.value.scrollHeight + 200;
          }
        }, 100);
      }
    );
    const ptyExitListener = window.ipcRenderer.answerMain(
      'pty-exit',
      ({ name }) => {
        state.terminals[name].status = 'idle';
      }
    );

    function toggleScript() {
      if (terminal.value.status === 'running') {
        window.ipcRenderer.callMain('kill-terminal', terminalId.value);
      } else {
        const command = props.packageJSON.scripts[state.activeScript];

        window.ipcRenderer.callMain('run-script', {
          useChildProcess: true,
          name: terminalId.value,
          cwd: props.project.path,
          command,
        });

        state.terminals[terminalId.value] = {
          log: command + '\n\n',
          status: 'running',
        };
      }
    }

    watch(
      () => props.packageJSON,
      ({ scripts }) => {
        if (!scripts) return;

        const keys = Object.keys(scripts);

        keys.forEach((key) => {
          const id = `${props.project.id}__${key}`;

          if (state.terminals[id]) return;

          window.ipcRenderer.callMain('log-terminal', id).then((data) => {
            console.log(id, data);
            state.terminals[id] = data;
          });
        });

        state.activeScript = keys[0];
      },
      { immediate: true }
    );

    onMounted(() => {
      // to do: get data from lo
      // let count = 0;
      // setInterval(() => {
      //   count += 1;
      //   state.terminals += `Count: ${count} \n`;
      // }, 500);
    });
    onUnmounted(() => {
      ptyDataListener();
      ptyExitListener();
    });

    return {
      state,
      terminal,
      container,
      terminalId,
      toggleScript,
    };
  },
};
</script>
