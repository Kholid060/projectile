<template>
  <ui-list>
    <ui-list-item small :active="$route.name === 'home'">
      <v-mdi name="mdiFolderEditOutline" class="mr-2"></v-mdi>
      <span>Projects</span>
    </ui-list-item>
  </ui-list>
</template>
