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
          :title="getText(pkg)"
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
import { onUnmounted, onMounted } from 'vue';
import { useStore } from 'vuex';
import emitter from 'tiny-emitter/instance';

export default {
  setup() {
    const store = useStore();

    const ptyExitListener = window.ipcRenderer.answerMain(
      'package-pty-exit',
      ({ name }) => {
        window.ipcRenderer
          .callMain('remove-terminal', {
            name,
            clean: true,
          })
          .then(() => {
            emitter.emit('refresh-package-json');
            store.dispatch('nextPackageQueue');
          });
      }
    );

    const unsubscribe = store.subscribe(({ type, payload }, state) => {
      if (type === 'addPackagesQueue' && !state.currentQueue) {
        store.commit('updateState', {
          key: 'currentQueue',
          value: payload.id,
        });
      }
    });
    const unwatch = store.watch(
      (state) => state.currentQueue,
      async (value) => {
        try {
          const pkg = store.state.packagesQueue.find(({ id }) => id === value);

          if (!pkg) return;

          const pkgManager = await window.ipcRenderer.callMain(
            'get-package-manager',
            pkg.path
          );
          const actions = {
            install: pkgManager === 'npm' ? 'install' : 'add',
            remove: pkgManager === 'npm' ? 'uninstall' : 'remove',
          };
          const param = pkg.location === 'devDeps' ? '-D' : '';
          const pkgVersion = pkg.type === 'install' ? `@${pkg.version}` : '';
          const command = `${pkgManager} ${actions[pkg.type]} ${
            pkg.name
          }${pkgVersion} ${param}`;

          await window.ipcRenderer.callMain('run-script', {
            useChildProcess: true,
            type: 'package',
            name: pkg.id,
            cwd: pkg.path,
            command,
          });
        } catch (error) {
          console.error(error);
        }
      }
    );

    function getText(data) {
      let text = `${data.type} ${data.name}`;

      if (data.type === 'install') text += `@${data.version}`;

      return text + ` at ${data.path}`;
    }
    function abortAction(id) {
      window.ipcRenderer.callMain('kill-terminal', id).then(() => {
        store.dispatch('packagesQueue', {
          id,
          type: 'delete',
        });
      });
    }

    onMounted(() => {
      window.ipcRenderer.callMain('log-terminal').then((data) => {
        const packagesQueue = JSON.parse(
          localStorage.getItem('packages-queue') || '[]'
        );

        store.commit('updateState', {
          key: 'packagesQueue',
          value: packagesQueue,
        });

        Object.keys(data).forEach((key) => {
          const isKeyExist = packagesQueue.some((pkg) => pkg.id === key);

          if (!key.startsWith('package') || !isKeyExist) return;

          store.commit('updateState', {
            key: 'currentQueue',
            value: key,
          });
        });
      });
    });
    onUnmounted(() => {
      unwatch();
      unsubscribe();
      ptyExitListener();
    });

    return {
      getText,
      abortAction,
    };
  },
};
</script>
