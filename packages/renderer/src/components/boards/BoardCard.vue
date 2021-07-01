<template>
  <ui-card class="group">
    <div class="flex items-center">
      <p class="text-overflow flex-1 cursor-pointer pr-2" @click="editCard">
        {{ card.name }}
      </p>
      <ui-popover>
        <template #trigger="{ isShow }">
          <v-mdi
            name="mdi-dots-horizontal"
            class="text-gray-200"
            role="button"
            :class="{ 'invisible group-hover:visible': !isShow }"
          ></v-mdi>
        </template>
        <ui-list class="space-y-1 w-36">
          <ui-list-item
            v-close-popover
            class="cursor-pointer"
            small
            @click="editCard"
          >
            <v-mdi name="mdi-pencil-outline" class="mr-2"></v-mdi>
            <span>Edit</span>
          </ui-list-item>
          <ui-list-item
            v-close-popover
            class="text-red-400 cursor-pointer"
            small
            @click="deleteCard"
          >
            <v-mdi name="mdi-delete-outline" class="mr-2"></v-mdi>
            <span>Delete</span>
          </ui-list-item>
        </ui-list>
      </ui-popover>
    </div>
    <p class="line-clamp whitespace-normal text-gray-200">
      {{ card.description }}
    </p>
    <ui-popover v-if="card.data.tasks.length !== 0" class="mt-4">
      <template #trigger>
        <button
          class="
            py-1
            px-2
            text-sm
            rounded-lg
            border
            text-gray-300
            bg-gray-100 bg-opacity-5
          "
        >
          <v-mdi
            name="mdiCheckboxMarkedCircleOutline"
            size="20"
            class="mr-1"
          ></v-mdi>
          {{ taskDone }}/{{ card.data.tasks.length }}
        </button>
      </template>
      <p class="mb-2">Tasks</p>
      <ui-list class="w-44 max-h-52 scroll overflow-auto">
        <ui-list-item v-for="task in card.data.tasks" :key="task.id">
          <ui-checkbox
            :model-value="task.done"
            @change="updateTask(task.id, $event)"
          ></ui-checkbox>
          <span class="ml-4 flex-1 text-overflow">{{ task.name }}</span>
        </ui-list-item>
      </ui-list>
    </ui-popover>
  </ui-card>
</template>
<script>
import { computed } from 'vue';
import Card from '@/models/card';

export default {
  props: {
    card: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['edit'],
  setup(props, { emit }) {
    const taskDone = computed(
      () => props.card.data.tasks.filter(({ done }) => done).length
    );

    function updateTask(id, event) {
      const copyTasks = [...props.card.data.tasks];
      const taskIndex = copyTasks.findIndex((task) => task.id === id);

      copyTasks[taskIndex].done = event;

      Card.update({
        where: props.card.id,
        data: {
          data: {
            tasks: copyTasks,
          },
        },
      });
    }
    function editCard() {
      emit('edit', { type: 'card', data: props.card });
    }
    function deleteCard() {
      Card.delete(props.card.id);
    }

    return {
      taskDone,
      editCard,
      updateTask,
      deleteCard,
    };
  },
};
</script>
