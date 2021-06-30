<template>
  <ui-modal :model-value="state.show" content-class="max-w-sm" persist>
    <template #header>
      <p>{{ state.options.title }}</p>
    </template>
    <ui-input
      v-if="state.type === 'prompt'"
      v-model="state.options.input"
      class="w-full"
      autofocus
      :placeholder="state.options.placeholder"
      :label="state.options.label"
    ></ui-input>
    <p v-else class="text-gray-600">{{ state.options.body }}</p>
    <div class="mt-8 flex space-x-2">
      <ui-button class="w-6/12" @click="fireCallback('onCancel')">
        {{ state.options.cancelText }}
      </ui-button>
      <ui-button
        class="w-6/12"
        :variant="state.options.okVariant"
        @click="fireCallback('onConfirm')"
      >
        {{ state.options.okText }}
      </ui-button>
    </div>
  </ui-modal>
</template>
<script>
import { reactive, watch } from 'vue';
import emitter from 'tiny-emitter/instance';

export default {
  setup() {
    const initialOptions = {
      html: false,
      body: '',
      input: '',
      title: '',
      placeholder: '',
      label: '',
      okText: 'Confirm',
      okVariant: 'primary',
      cancelText: 'Cancel',
      onConfirm: null,
      onCancel: null,
    };
    const state = reactive({
      show: false,
      type: '',
      options: initialOptions,
    });

    emitter.on('show-dialog', (type, options) => {
      state.type = type;
      state.options = {
        ...initialOptions,
        ...options,
      };

      state.show = true;
    });

    function fireCallback(type) {
      const callback = state.options[type];
      const param = state.type === 'prompt' ? state.options.input : true;

      if (callback) callback(param);

      state.show = false;
      state.options = initialOptions;
    }
    function keyupHandler({ code }) {
      if (code === 'Enter') {
        fireCallback('onConfirm');
      } else if (code === 'Escape') {
        fireCallback('onCancel');
      }
    }

    watch(
      () => state.show,
      (value) => {
        if (value) {
          window.addEventListener('keyup', keyupHandler);
        } else {
          window.removeEventListener('keyup', keyupHandler);
        }
      }
    );

    return {
      state,
      fireCallback,
    };
  },
};
</script>
