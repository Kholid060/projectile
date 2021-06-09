<template>
  <component
    :is="tag"
    class="
      ui-list-item
      rounded-lg
      flex
      items-center
      transition
      w-full
      focus:outline-none
    "
    role="listitem"
    :class="[
      active
        ? 'bg-primary bg-opacity-10 text-primary'
        : 'hover:bg-gray-100 focus:bg-gray-100 focus:bg-opacity-5 hover:bg-opacity-5',
      small ? 'p-2' : 'py-2 px-4',
      { 'pointer-events-none bg-opacity-75': disabled },
    ]"
  >
    <slot></slot>
  </component>
</template>
<script>
export default {
  props: {
    active: Boolean,
    disabled: Boolean,
    small: Boolean,
    tag: {
      type: String,
      default: 'div',
    },
  },
};
</script>
