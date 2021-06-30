<template>
  <ui-card class="issue-card group">
    <div class="flex items-center text-gray-300 mb-2">
      <v-mdi
        :name="
          card.data.pull_request
            ? 'mdi-source-pull'
            : 'mdi-record-circle-outline'
        "
        :class="[
          card.data.state === 'closed' ? 'text-red-400' : 'text-green-500',
        ]"
        size="20"
        class="mr-1"
      >
      </v-mdi>
      <span class="text-sm text-overflow flex-1 pr-2">
        {{ card.data.user.login }}#{{ card.data.number }}
      </span>
      <v-mdi
        name="mdi-delete-outline"
        role="button"
        class="group-hover:visible invisible text-red-400"
        @click="deleteCard"
      ></v-mdi>
    </div>
    <p class="leading-tight line-clamp text-gray-100" :title="card.data.title">
      {{ card.data.title }}
    </p>
    <div class="flex items-center mt-2 overflow-auto scroll space-x-1">
      <span
        v-for="label in card.data.labels"
        :key="label.id"
        :style="{
          backgroundColor: `#${label.color}`,
          color: textColor(label.color),
        }"
        :title="label.description"
        class="py-1 px-2 rounded-full text-sm flex-shrink-0"
      >
        {{ label.name }}
      </span>
    </div>
  </ui-card>
</template>
<script>
import { hexToRgb, getTextColor } from '@/utils/helper';
import Card from '@/models/card';

export default {
  props: {
    card: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    function deleteCard() {
      Card.delete(props.card.id);
    }
    function textColor(hex) {
      const rgb = hexToRgb(hex);

      return getTextColor(rgb);
    }

    return {
      textColor,
      deleteCard,
    };
  },
};
</script>
