<template>
  <button
    :class="[
      value === activeTab
        ? 'border-primary text-blue-400'
        : 'border-transparent',
      padding,
    ]"
    class="
      focus:ring-0
      border-b-2
      focus:ring-0
      hover:text-blue-400
      transition
      flex-shrink-0
    "
    @click="changeActiveTab(value)"
  >
    <slot></slot>
  </button>
</template>
<script>
import { inject } from 'vue';

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    padding: {
      type: String,
      default: 'py-3 px-4',
    },
  },
  setup() {
    const activeTab = inject('activeTab');
    const changeActiveTab = inject('changeActiveTab');

    return {
      activeTab,
      changeActiveTab,
    };
  },
};
</script>
