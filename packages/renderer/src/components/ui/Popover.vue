<template>
  <div class="ui-popover inline-block" :class="{ hidden: to }">
    <div ref="targetEl" class="ui-popover__trigger inline-block">
      <slot name="trigger"></slot>
    </div>
    <div
      ref="content"
      class="ui-popover__content bg-white p-4 rounded-xl shadow-xl"
    >
      <slot></slot>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, watch, shallowRef } from 'vue';
import createTippy from '@/utils/createTippy';

export default {
  props: {
    placement: {
      type: String,
      default: 'bottom',
    },
    trigger: {
      type: String,
      default: 'click',
    },
    to: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const targetEl = ref(null);
    const content = ref(null);
    const instance = shallowRef(null);

    watch(
      () => props.disabled,
      (value) => {
        if (value) {
          instance.value.enable();
        } else {
          instance.value.hide();
          instance.value.disable();
        }
      }
    );

    onMounted(() => {
      const target = props.to
        ? document.querySelector(props.to)
        : targetEl.value;

      instance.value = createTippy(target, {
        role: 'popover',
        theme: null,
        content: content.value,
        placement: props.placement,
        trigger: props.trigger,
        interactive: true,
        appendTo: () => document.body,
      });
    });

    return {
      targetEl,
      content,
    };
  },
};
</script>
<style>
.tippy-box[role~='popover'] > .tippy-svg-arrow {
  fill: white !important;
}
</style>
