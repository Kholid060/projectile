<template>
  <div class="add-card">
    <ui-input
      v-model="card.name"
      autofocus
      type="text"
      class="focus:ring-0 bg-transparent block w-full"
      label="Name"
    />
    <ui-textarea
      v-model="card.description"
      class="block mt-2 bg-transparent w-full focus:ring-0"
      label="Description"
    ></ui-textarea>
    <div class="flex items-center">
      <p class="my-2">Tasks</p>
      <div class="flex-grow"></div>
      <v-mdi name="mdi-plus" class="cursor-pointer" @click="addTask"></v-mdi>
    </div>
    <ui-list class="space-y-1 max-h-64 scroll overflow-auto">
      <transition-group-list>
        <ui-list-item
          v-for="(task, index) in card.data.tasks"
          :id="task.id"
          :key="task.id"
          :class="{ 'bg-opacity-5 bg-gray-100': task.id === editTaskId }"
          class="group transition-list"
        >
          <ui-checkbox
            v-model="card.data.tasks[index].done"
            class="mr-4"
          ></ui-checkbox>
          <input
            v-if="task.id === editTaskId"
            v-model="card.data.tasks[index].name"
            v-autofocus
            type="text"
            class="bg-transparent focus:ring-0 flex-1"
            @keyup.enter="(event) => event.target.blur()"
            @blur="editTaskId = ''"
          />
          <label v-else class="flex-1 text-overflow" :for="task.id">
            {{ task.name }}
          </label>
          <div class="group-hover:block hidden ml-4">
            <v-mdi
              name="mdi-pencil-outline"
              class="mr-2 cursor-pointer"
              @click="editTaskId = task.id"
            ></v-mdi>
            <v-mdi
              name="mdi-delete-outline"
              class="text-red-500 cursor-pointer"
              @click="deleteTask(index)"
            ></v-mdi>
          </div>
        </ui-list-item>
      </transition-group-list>
    </ui-list>
    <ui-button variant="primary" class="mt-8 w-full" @click="saveCard">
      Save
    </ui-button>
  </div>
</template>
<script>
import { reactive, ref, onMounted } from 'vue';
import { nanoid } from 'nanoid';
import merge from 'deepmerge';
import Card from '@/models/card';

export default {
  props: {
    boardId: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['save'],
  setup(props, { emit }) {
    const editTaskId = ref('');
    const card = reactive({
      name: '',
      description: '',
      data: {
        tasks: [],
      },
    });

    function addTask() {
      const id = nanoid();

      card.data.tasks.unshift({
        id,
        name: 'untitled',
        done: false,
      });
      editTaskId.value = id;
    }
    function deleteTask(index) {
      card.data.tasks.splice(index, 1);
    }
    function saveCard() {
      let maxOrder = Card.query().where('boardId', props.boardId).max('order');

      if (card.id) {
        maxOrder = card.order;
      }

      Card.insertOrUpdate({
        data: {
          ...card,
          type: 'card',
          order: card.id ? maxOrder : maxOrder + 1,
          id: card.id ? card.id : nanoid(),
          boardId: props.boardId,
        },
      });

      emit('save');
    }

    onMounted(() => {
      Object.assign(card, merge({}, props.data));
    });

    return {
      card,
      addTask,
      saveCard,
      editTaskId,
      deleteTask,
    };
  },
};
</script>
