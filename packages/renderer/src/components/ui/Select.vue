<template>
  <label :class="[block ? 'block' : 'inline-block']">
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
      "
      :value="modelValue"
      @change="emitValue"
    >
      <option v-if="placeholder" value="" disabled selected>
        {{ placeholder }}
      </option>
      <slot></slot>
    </select>
  </label>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    block: Boolean,
    showDetail: Boolean,
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    function emitValue({ target }) {
      emit("update:modelValue", target.value);
      emit("change", target.value);
    }

    return {
      emitValue,
    };
  },
};
</script>
<style>
.ui-select__arrow {
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
}
</style>
