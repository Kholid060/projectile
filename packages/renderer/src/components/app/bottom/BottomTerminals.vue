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
    <ui-tabs
      v-model="state.activeTerminal"
      class="text-sm text-gray-200 overflow-auto scroll"
      manual
    >
      <ui-tab
        v-for="(terminal, index) in state.terminals"
        :key="terminal.id"
        :value="terminal.id"
        class="flex-shrink-0 group flex items-center text-left px-2 w-32 h-10"
        style="border-right-color: rgba(255, 255, 255, 0.05)"
        padding=""
      >
        <p :title="terminal.name" class="flex-1 text-overflow">
          {{ terminal.name }}
        </p>
        <v-mdi
          name="mdi-close"
          size="18"
          class="invisible group-hover:visible text-gray-200"
          @click.stop="removeTerminal(terminal.id, index)"
        ></v-mdi>
      </ui-tab>
      <button
        v-tooltip="'Add terminal'"
        class="h-10 focus:ring-0 focus:outline-none flex-shrink-0 ml-2"
        @click="createTerminal"
      >
        <v-mdi name="mdi-plus"></v-mdi>
      </button>
    </ui-tabs>
    <!-- <div class="flex items-center p-2">
      <select
        class="text-sm bg-gray-100 rounded-md bg-opacity-5 p-1 capitalize"
        v-model="state.activeTerminal"
      >
        <option
          v-for="terminal in state.terminals"
          :key="terminal.id"
          :value="terminal.id"
          class="bg-gray-700"
        >
          {{ terminal.name }}
        </option>
      </select>
      <v-mdi
        class="ml-2 cursor-pointer focus:outline-none"
        name="mdi-plus"
        @click="createTerminal"
        v-tooltip="'Add terminal'"
      ></v-mdi>
      <div class="flex-grow"></div>
      <v-mdi
        class="mr-2 cursor-pointer text-gray-200"
        size="20"
        name="mdi-backspace-outline"
        v-tooltip="'Clear logs'"
      ></v-mdi>
      <v-mdi
        class="mr-2 cursor-pointer text-gray-200"
        name="mdi-delete-outline"
        v-tooltip="'Delete terminal'"
      ></v-mdi>
      <input
        class="bg-gray-100 bg-opacity-5 py-1 px-2 text-sm rounded-md transition"
        placeholder="Search..."
      />
    </div> -->
    <bottom-terminal :active-terminal="state.activeTerminal"></bottom-terminal>
  </div>
</template>
<script>
import { ref, reactive, onMounted } from 'vue';
import { nanoid } from 'nanoid';
import BottomTerminal from './BottomTerminal.vue';

export default {
  components: { BottomTerminal },
  setup() {
    let terminalId = 0;

    const container = ref(null);
    const state = reactive({
      terminals: [],
      activeTerminal: '',
    });

    function mousemoveEvent(event) {
      const height = window.innerHeight - event.clientY - 20;

      if (event.clientY < 50 || height < 80) return;

      container.value.style.height = height + 'px';
    }
    function mouseupEvent(event) {
      document.body.classList.remove('select-none');
      document.documentElement.removeEventListener('mousemove', mousemoveEvent);
      document.documentElement.removeEventListener('mouseup', mouseupEvent);
    }
    function initResize(event) {
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
          cwd: window.homedir,
        })
        .then(() => {
          state.terminals.push({
            id,
            name: `Terminal ${terminalId}`,
          });

          state.activeTerminal = id;
        });
    }
    function removeTerminal(id, index) {
      window.ipcRenderer
        .callMain('remove-terminal', {
          name: id,
          clean: true,
        })
        .then(() => {
          state.terminals.splice(index, 1);

          if (state.terminals.length >= 1 && state.activeTerminal === id) {
            state.activeTerminal = state.terminals[0].id;
          }

          window.ipcRenderer.callMain('log-terminal').then((value) => {
            console.log(id);
            console.log(value);
          });
        });
    }

    onMounted(() => {
      window.ipcRenderer.callMain('log-terminal').then((logs) => {
        Object.entries(logs).forEach(([key, value], index) => {
          if (key.startsWith('terminal')) {
            terminalId += 1;

            state.terminals.push({
              id: key,
              name: `Terminal ${terminalId}`,
              log: value.log,
            });
            console.log(state.terminals);
          }
        });
      });
    });

    return {
      state,
      container,
      initResize,
      removeTerminal,
      createTerminal,
    };
  },
};
</script>
