<template>
  <div
    id="bottom-terminals"
    ref="container"
    class="absolute bg-gray-1000 left-0 w-full h-64"
    style="bottom: 1.5rem"
  >
    <div
      class="
        absolute
        border-t
        h-1
        hover:bg-primary hover:bg-opacity-20
        transition
        top-0
        w-full
        left-0
      "
      style="cursor: n-resize"
      @mousedown="initResize"
    ></div>
    <div class="flex items-center border-b">
      <ui-tabs
        v-model="state.activeTerminal"
        class="text-sm border-b-0 flex-1 text-gray-200 overflow-auto scroll"
        manual
      >
        <ui-tab
          v-for="(terminal, id) in state.terminals"
          :key="id"
          :value="id"
          class="flex-shrink-0 group flex items-center text-left px-2 w-32 h-10"
          style="border-right-color: rgba(255, 255, 255, 0.05)"
          padding=""
        >
          <p :title="terminal.title" class="flex-1 text-overflow">
            {{ terminal.title || '~' }}
          </p>
          <v-mdi
            name="mdi-close"
            size="18"
            class="invisible group-hover:visible text-gray-200"
            @click.stop="removeTerminal(id, index)"
          ></v-mdi>
        </ui-tab>
      </ui-tabs>
      <button
        v-tooltip="'Add terminal'"
        class="h-10 focus:ring-0 focus:outline-none flex-shrink-0 mx-2"
        @click="createTerminal"
      >
        <v-mdi name="mdi-plus"></v-mdi>
      </button>
      <button
        class="h-10 focus:ring-0 focus:outline-none flex-shrink-0 mx-2"
        @click="$emit('close')"
      >
        <v-mdi name="mdi-close"></v-mdi>
      </button>
    </div>
    <bottom-terminal
      v-if="state.activeTerminal && Object.keys(state.terminals).length !== 0"
      :active-terminal="state.activeTerminal"
      @title="updateTerminalTitle"
    ></bottom-terminal>
    <p v-else class="my-4 text-center text-gray-200">No terminal is selected</p>
  </div>
</template>
<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { nanoid } from 'nanoid';
import BottomTerminal from './BottomTerminal.vue';

export default {
  components: { BottomTerminal },
  emits: ['close'],
  setup() {
    let terminalId = 0;

    const container = ref(null);
    const state = reactive({
      terminals: {},
      activeTerminal: '',
    });

    const terminal = computed(() => state.terminals[state.activeTerminal]);

    function mousemoveEvent(event) {
      const height = window.innerHeight - event.clientY - 20;

      if (event.clientY < 50 || height < 80) return;

      localStorage.setItem('terminal-height', height);

      container.value.style.height = height + 'px';
    }
    function mouseupEvent() {
      document.body.classList.remove('select-none');
      document.documentElement.removeEventListener('mousemove', mousemoveEvent);
      document.documentElement.removeEventListener('mouseup', mouseupEvent);
    }
    function initResize() {
      document.body.classList.add('select-none');
      document.documentElement.addEventListener('mousemove', mousemoveEvent);
      document.documentElement.addEventListener('mouseup', mouseupEvent);
    }
    function createTerminal() {
      terminalId += 1;

      const id = `terminal_${nanoid()}`;

      window.ipcRenderer
        .callMain('create-terminal', {
          name: id,
          type: 'terminal',
          cwd: window.homedir,
        })
        .then(() => {
          state.terminals[id] = {
            title: `Terminal ${terminalId}`,
          };

          state.activeTerminal = id;
        });
    }
    function removeTerminal(id) {
      window.ipcRenderer
        .callMain('remove-terminal', {
          name: id,
          clean: true,
        })
        .then(() => {
          delete state.terminals[id];

          const terminalIds = Object.keys(state.terminals);

          if (terminalIds.length >= 1 && state.activeTerminal === id) {
            state.activeTerminal = terminalIds[0];
          }
        });
    }
    function updateTerminalTitle(value) {
      const isValidValue = value.replace(/\s/g, '').length >= 1;

      state.terminals[state.activeTerminal].title = isValidValue ? value : '~';
    }

    onMounted(() => {
      const cacheHeight = localStorage.getItem('terminal-height');

      if (cacheHeight) {
        container.value.style.height = cacheHeight + 'px';
      }

      window.ipcRenderer.callMain('log-terminal').then((logs) => {
        Object.entries(logs).forEach(([key, value]) => {
          if (key.startsWith('terminal') && value.log) {
            terminalId += 1;

            state.terminals[key] = {
              title: `Terminal ${terminalId}`,
            };
          }
        });

        const activeTerminal = localStorage.getItem('active-terminal');

        if (activeTerminal && state.terminals[activeTerminal]) {
          state.activeTerminal = activeTerminal;
        }
      });
    });

    return {
      state,
      terminal,
      container,
      initResize,
      removeTerminal,
      createTerminal,
      updateTerminalTitle,
    };
  },
};
</script>
