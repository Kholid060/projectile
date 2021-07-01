<template>
  <input
    type="checkbox"
    class="
      rounded-lg
      border-gray-300
      text-primary
      shadow-sm
      cursor-pointer
      focus:border-primary focus:ring focus:ring-primary
      transition
      h-4
      w-4
      focus:ring-opacity-50
    "
    :value="modelValue"
    v-bind="{ checked: modelValue }"
    @change="changeHandler"
  />
</template>
<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    function changeHandler({ target: { checked } }) {
      emit('update:modelValue', checked);
      emit('change', checked);
    }

    return {
      changeHandler,
    };
  },
};
</script>
