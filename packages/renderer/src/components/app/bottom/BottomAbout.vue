<template>
  <ui-card class="general w-full max-w-md text-center">
    <div class="bg-input rounded-full overflow-hidden p-2 inline-block mb-2">
      <img src="@/assets/images/icon.png" class="w-24 rounded-full" />
    </div>
    <h1 class="capitalize text-lg">{{ name }} {{ version }}</h1>
    <p class="text-gray-300">
      An app that will help you to manage your JavaScript projects.
    </p>
    <ui-button class="mt-4" v-bind="{ loading }" @click="checkUpdate">
      Check for update
    </ui-button>
    <div class="mt-8 mb-2 space-x-8 text-gray-300">
      <a
        v-for="link in links"
        :key="link.name"
        :href="link.url"
        target="_blank"
        class="hover:text-white transition"
      >
        <v-mdi :name="link.icon" />
        <span class="align-middle ml-1">{{ link.name }}</span>
      </a>
    </div>
  </ui-card>
</template>
<script setup>
import { ref } from 'vue';

/* eslint-disable-next-line */
const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  version: {
    type: String,
    default: '',
  },
});

const links = [
  {
    name: 'Website',
    url: 'https://notething.vercel.app',
    icon: 'mdi-web',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/kholid060/notething',
    icon: 'mdi-github',
  },
];

const loading = ref(false);

function checkUpdate() {
  loading.value = true;

  fetch(`https://api.github.com/repos/kholid060/projectile/releases/latest`)
    .then((response) => response.json())
    .then((result) => {
      if (!result.tag_name) throw new Error();

      const isLatest = result.tag_name === `v${props.version}`;

      window.electron.ipcRenderer.callMain('dialog:message', {
        type: 'info',
        title: isLatest ? 'Check for update' : 'Found Updates',
        message: isLatest
          ? "You're using the latest version of the app"
          : `Found updates, Projectile ${result.tag_name}`,
      });

      loading.value = false;
    })
    .catch((error) => {
      console.error(error);
      loading.value = false;
    });
}
</script>

