<template>
  <div
    ref="container"
    style="height: calc(100% - 46px); background-color: #0e131f"
    class="p-2 overflow-hidden"
  ></div>
</template>
<script>
import { ref, onMounted, onUnmounted, shallowReactive } from 'vue';
import xterm from '@/lib/xterm';
import { debounce } from '@/utils/helper';

export default {
  props: {
    activeTerminal: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    let observer = null;
    let terminal = null;
    const blackListKeys = [
      9, 13, 16, 17, 18, 19, 20, 27, 35, 36, 37, 38, 39, 40, 91, 93, 224,
    ];

    const container = ref(null);
    const commandInput = shallowReactive({
      text: '',
      index: 0,
    });

    window.ipcRenderer.answerMain('pty-data', ({ data, status, name }) => {
      if (!terminal) return;

      terminal.write(data);
    });

    onMounted(() => {
      terminal = xterm(container.value, {
        theme: { background: '#0e131f' },
      });

      terminal.onKey(
        debounce(({ key }) => {
          window.ipcRenderer.callMain('write-terminal', {
            name: props.activeTerminal,
            command: key,
          });
        }),
        200
      );

      terminal.onTitleChange((title) => {
        console.log('title', title);
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
    });

    return {
      container,
    };
  },
};
</script>
