<template>
  <div
    ref="container"
    style="height: calc(100% - 46px); background-color: #0e131f"
    class="p-2 overflow-hidden"
  ></div>
</template>
<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import xterm from '@/lib/xterm';
import { debounce } from '@/utils/helper';

export default {
  props: {
    activeTerminal: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    let observer = null;
    let terminal = null;

    const container = ref(null);
    const isDone = ref(false);

    const ptyDataListener = window.ipcRenderer.answerMain(
      'terminal-pty-data',
      ({ data, name }) => {
        if (!terminal || !name.startsWith('terminal') || !isDone.value) return;

        terminal.write(data);
      }
    );

    function insertCacheLogs() {
      if (!terminal) return;

      localStorage.setItem('active-terminal', props.activeTerminal);

      window.ipcRenderer
        .callMain('log-terminal', props.activeTerminal)
        .then((data) => {
          terminal.reset();
          terminal.write(data.log);
          isDone.value = true;
        });
    }

    watch(() => props.activeTerminal, insertCacheLogs);

    onMounted(() => {
      terminal = xterm(container.value, {
        theme: { background: '#0e131f' },
      });

      insertCacheLogs();

      terminal.onKey(({ key }) => {
        window.ipcRenderer.callMain('write-terminal', {
          name: props.activeTerminal,
          command: key,
        });
      });

      terminal.onTitleChange((title) => {
        emit('title', title);
      });

      observer = new ResizeObserver(
        debounce(() => {
          if (!terminal) return;

          terminal.fitAddon.fit();
        }),
        200
      );
      observer.observe(document.querySelector('#bottom-terminals'));

      container.value.querySelector('.xterm-viewport').classList.add('scroll');
    });
    onUnmounted(() => {
      if (observer) observer.disconnect();

      ptyDataListener();
    });

    return {
      container,
    };
  },
};
</script>
