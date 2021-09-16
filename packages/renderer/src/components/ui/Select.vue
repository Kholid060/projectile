<template>
  <label :class="[block ? 'block' : 'inline-block']" class="relative">
    <span v-if="label" class="text-gray-200 text-sm ml-2">{{ label }}</span>
    <select
      class="
        rounded-lg
        ui-select
        w-full
        block
        transition
        bg-gray-100 bg-opacity-5
        hover:bg-opacity-10
        pl-4
        pr-10
        py-2
        z-10
        relative
        appearance-none
      "
      :value="modelValue"
      @change="emitValue"
    >
      <option v-if="placeholder" value="" disabled selected>
        {{ placeholder }}
      </option>
      <slot></slot>
    </select>
    <v-mdi
      name="mdiChevronDown"
      class="absolute top-1/2 right-0 mr-3 z-0"
      style="transform: translateY(-50%)"
    />
  </label>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    block: Boolean,
    showDetail: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    function emitValue({ target }) {
      emit('update:modelValue', target.value);
      emit('change', target.value);
    }

    return {
      emitValue,
    };
  },
};
</script>
<style>
.ui-select option,
.ui-select optgroup {
  background-color: theme('colors.gray.700');
}
</style>
