<template>
  <div class="p-12 container">
    <div class="flex items-center mb-12">
      <h2 class="text-2xl font-semibold">Projects</h2>
      <div class="flex-grow"></div>
      <ui-input placeholder="Search" prepend-icon="mdi-magnify"></ui-input>
      <ui-button icon class="ml-2">
        <v-mdi name="mdi-filter-outline"></v-mdi>
      </ui-button>
      <ui-button variant="primary" class="ml-2">
        <v-mdi name="mdi-plus" class="mr-1 -ml-2"></v-mdi>
        Project
      </ui-button>
    </div>
    <div class="grid grid-cols-3 gap-5">
      <ui-card
        v-for="i in 17"
        :key="i"
        tabindex="0"
        class="focus:ring focus:outline-none transition"
      >
        <h4>Some title here</h4>
        <p class="text-gray-300 h-12 line-clamp">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam,
        </p>
        <div class="flex items-center text-gray-300 mt-2">
          <p class="flex-1 text-overflow pr-2">v1.0</p>
          <img src="../assets/svg/react.svg" class="w-8" />
        </div>
      </ui-card>
    </div>
  </div>
</template>
<script>
import { remote } from "electron";

export default {
  setup() {
    console.log(remote);

    function importProject() {}

    return {
      importProject,
    };
  },
};
</script>
