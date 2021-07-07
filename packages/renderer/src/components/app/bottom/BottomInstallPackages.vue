<template>
  <ui-popover
    v-if="$store.state.packagesQueue.length !== 0"
    trigger="click mouseenter"
    class="ml-2"
  >
    <template #trigger>
      <ui-spinner size="18" class="cursor-pointer"></ui-spinner>
    </template>
    <p class="text-sm mb-2">Packages Queue</p>
    <ul class="w-48 space-y-1 max-h-40 block scroll overflow-auto">
      <li
        v-for="pkg in $store.state.packagesQueue"
        :key="pkg.id"
        class="flex items-center group"
      >
        <p
          class="flex-1 text-overflow pr-2"
          :class="[
            pkg.id === $store.state.currentQueue
              ? 'text-blue-400'
              : 'text-gray-200',
          ]"
          :title="getText(pkg) + ` at ${pkg.path}`"
        >
          {{ getText(pkg) }}
        </p>
        <v-mdi
          name="mdi-close"
          class="text-gray-200 cursor-pointer group-hover:visible"
          size="20"
          title="Abort action"
          :class="{ invisible: pkg.id !== $store.state.currentQueue }"
          @click="abortAction(pkg.id)"
        ></v-mdi>
      </li>
    </ul>
  </ui-popover>
</template>
<script>
import { onUnmounted } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    const ptyDataListener = window.ipcRenderer.answerMain(
      'package-pty-data',
      (data) => {
        console.log(data);
      }
    );
    const ptyExitListener = window.ipcRenderer.answerMain(
      'package-pty-exit',
      (data) => {
        console.log(data, 'exit');
      }
    );

    const unsubscribe = store.subscribe(({ type, payload }, state) => {
      if (type === 'addPackagesQueue' && !state.currentQueue) {
        store.commit('updateState', {
          key: 'currentQueue',
          value: payload.id,
        });
        // const command = payload.data.type === 'install' ? 'install' : 'remove';

        // window.ipcRenderer.callMain('run-script', {
        //   useChildProcess: true,
        //   type: 'package',
        //   name: payload.id,
        //   cwd: payload.path,
        //   command: (),
        // });
      }
    });
    const unwatch = store.watch(
      (state) => state.currentQueue,
      (value) => {
        console.log(value, 'watch');
      }
    );

    function getText(data) {
      let text = `${data.type} ${data.name}`;

      if (data.type === 'install') text += `@${data.version}`;

      return text;
    }
    function abortAction(id) {
      window.ipcRenderer
        .callMain('remove-terminal', {
          name: id,
          clean: true,
        })
        .then(() => {
          store.dispatch('packagesQueue', {
            id,
            type: 'delete',
          });
        });
    }

    onUnmounted(() => {
      unwatch();
      unsubscribe();
      ptyDataListener();
      ptyExitListener();
    });

    return {
      getText,
      abortAction,
    };
  },
};
</script>
