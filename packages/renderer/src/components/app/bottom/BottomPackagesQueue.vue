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
    const { ipcRenderer } = window.electron;
    const store = useStore();

    const ptyExitListener = ipcRenderer.answerMain(
      'package-pty-exit',
      ({ name }) => {
        ipcRenderer
          .callMain('terminal:remove', {
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
          console.log(pkg);
          if (!pkg) return;

          const command = await commandBuilder(pkg);

          await ipcRenderer.callMain('terminal:run-script', {
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

    async function commandBuilder(pkg) {
      const pkgManager = await ipcRenderer.callMain(
        'get:package-manager',
        pkg.path
      );
      const actions = {
        install: pkgManager === 'npm' ? 'install' : 'add',
        remove: pkgManager === 'npm' ? 'uninstall' : 'remove',
      };
      const commandPrefix = `${pkgManager} ${actions[pkg.action]}`;
      let command = '';

      if (pkg.isBatch) {
        if (pkg.deps) {
          command += `${commandPrefix} ${pkg.deps}`;
        }

        if (pkg.devDeps) {
          command += `${pkg.deps ? ' && ' : ''}${commandPrefix} ${
            pkg.devDeps
          } -D`;
        }
      } else {
        const param = pkg.location === 'devDeps' ? '-D' : '';
        const pkgVersion = pkg.action === 'install' ? `@${pkg.version}` : '';

        command += `${commandPrefix} ${pkg.name}${pkgVersion} ${param}`;
      }

      return command;
    }
    function getText(data) {
      let text;

      if (data.action === 'install' && !data.isBatch)
        text = `${data.action} ${data.name}@${data.version}`;
      else if (data.isBatch)
        text = `${data.type.split('_').join(' ')} packages`;

      return text + ` at ${data.path}`;
    }
    function abortAction(id) {
      ipcRenderer.callMain('terminal:kill', id).then(() => {
        store.dispatch('packagesQueue', {
          id,
          type: 'delete',
        });
      });
    }

    onMounted(() => {
      ipcRenderer.callMain('terminal:log').then((data) => {
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
