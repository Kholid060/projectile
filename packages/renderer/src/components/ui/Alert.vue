<template>
  <div
    v-if="modelValue"
    :class="variants[variant].color"
    class="ui-alert flex items-center rounded-lg p-4"
  >
    <div class="ui-alert__prepend mr-2">
      <slot name="prepend"></slot>
      <v-mdi :name="variants[variant].icon"></v-mdi>
    </div>
    <div class="flex-1">
      <slot></slot>
    </div>
    <div class="ui-alert__append ml-2">
      <slot name="append"></slot>
      <v-mdi
        v-if="dismissible"
        name="x"
        class="opacity-60 cursor-pointer"
        @click="close"
      ></v-mdi>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String,
      default: "primary",
    },
    dismissible: Boolean,
  },
  emits: ["update:modelValue", "close"],
  setup(props, { emit }) {
    const variants = {
      primary: {
        color: "text-primary bg-blue-100",
        icon: "information-circle",
      },
      error: {
        color: "bg-red-100 text-red-500",
        icon: "x-circle",
      },
      warning: {
        color: "text-yellow-500 bg-yellow-100",
        icon: "exclamaction",
      },
    };

    function close() {
      emit("update:modelValue", false);
      emit("close");
    }

    return {
      close,
      variants,
    };
  },
};
</script>
