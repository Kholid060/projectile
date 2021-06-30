<template>
  <div class="flex items-center border-b">
    <slot></slot>
  </div>
</template>
<script>
import { provide, computed } from 'vue';

export default {
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    provide(
      'activeTab',
      computed(() => props.modelValue)
    );
    provide('changeActiveTab', (value) => emit('update:modelValue', value));
  },
};
</script>
