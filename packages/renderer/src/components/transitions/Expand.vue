<template>
  <transition
    name="expand"
    :on-enter="enter"
    :on-after-enter="afterEnter"
    :on-leave="leave"
  >
    <slot></slot>
  </transition>
</template>
<script>
/* eslint-disable no-param-reassign, no-unused-expressions */
export default {
  setup() {
    function enter(element) {
      const { width } = getComputedStyle(element);

      element.style.width = width;
      element.style.position = "absolute";
      element.style.visibility = "hidden";
      element.style.height = "auto";

      const { height } = getComputedStyle(element);

      element.style.width = null;
      element.style.position = null;
      element.style.visibility = null;
      element.style.height = 0;

      getComputedStyle(element).height;

      requestAnimationFrame(() => {
        element.style.height = height;
      });
    }
    function afterEnter(element) {
      element.style.height = "auto";
    }
    function leave(element) {
      const { height } = getComputedStyle(element);

      element.style.height = height;

      getComputedStyle(element).height;

      requestAnimationFrame(() => {
        element.style.height = 0;
      });
    }

    return {
      enter,
      leave,
      afterEnter,
    };
  },
};
</script>
<style>
.expand-enter-active,
.expand-leave-active {
  transition: height 0.2s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}
</style>
