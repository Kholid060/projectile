<template>
  <label :class="[block ? 'block' : 'inline-block']">
    <span v-if="label" class="text-gray-200 text-sm block ml-1">{{
      label
    }}</span>
    <textarea
      ref="textarea"
      v-bind="{ value: modelValue, placeholder }"
      class="
        ui-textarea
        w-full
        rounded-lg
        py-2
        px-4
        transition
        bg-gray-100 bg-opacity-5
        hover:bg-opacity-10
        focus:bg-opacity-10
      "
      :class="{ 'overflow-hidden resize-none': autoresize }"
      :style="{ height }"
      @input="emitValue"
    ></textarea>
  </label>
</template>
<script>
import { ref, onMounted } from 'vue';

export default {
  props: {
    modelValue: {
      type: String,
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
    autoresize: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [Number, String],
      default: '',
    },
    block: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const textarea = ref(null);

    function calcHeight() {
      if (!props.autoresize) return;

      textarea.value.style.height = 'auto';
      textarea.value.style.height = `${textarea.value.scrollHeight}px`;
    }
    function emitValue(event) {
      const { value } = event.target;

      emit('update:modelValue', value);
      emit('change', value);
      calcHeight();
    }

    onMounted(calcHeight);

    return {
      textarea,
      emitValue,
    };
  },
};
</script>
