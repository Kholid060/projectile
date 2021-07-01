<template>
  <div class="flex flex-col w-72 flex-shrink-0 rounded-lg">
    <div class="flex items-center mb-4">
      <p class="text-overflow flex-1 pr-2" :title="board.name">
        {{ board.name }}
      </p>
      <ui-popover>
        <template #trigger>
          <v-mdi name="mdi-plus" class="cursor-pointer text-gray-200"></v-mdi>
        </template>
        <ui-list class="w-44 space-y-1 text-gray-200">
          <ui-list-item
            v-close-popover
            class="cursor-pointer"
            @click="$emit('modal', { type: 'card', id: board.id })"
          >
            <v-mdi name="mdi-text-box-outline" class="mr-2"></v-mdi>
            Card
          </ui-list-item>
          <ui-list-item
            v-if="repository"
            v-close-popover
            class="cursor-pointer"
            @click="$emit('modal', { type: 'issue', id: board.id })"
          >
            <v-mdi name="mdi-record-circle-outline" class="mr-2"></v-mdi>
            Issue card
          </ui-list-item>
        </ui-list>
      </ui-popover>
      <ui-popover>
        <template #trigger>
          <v-mdi
            name="mdi-dots-horizontal"
            class="text-gray-200 ml-2 cursor-pointer"
          ></v-mdi>
        </template>
        <ui-list class="space-y-1 text-gray-200 w-36">
          <ui-list-item
            v-close-popover
            class="cursor-pointer"
            @click="editBoard"
          >
            <v-mdi name="mdi-pencil-outline" class="-ml-1 mr-2"></v-mdi>
            Edit
          </ui-list-item>
          <ui-list-item
            v-close-popover
            class="cursor-pointer text-red-400"
            @click="deleteBoard"
          >
            <v-mdi name="mdi-delete-outline" class="-ml-1 mr-2"></v-mdi>
            Delete
          </ui-list-item>
        </ui-list>
      </ui-popover>
    </div>
    <draggable
      v-model="cards"
      :animation="500"
      item-key="id"
      group="cards"
      class="space-y-2 overflow-auto flex-1 scroll"
      @change="onDragChange"
    >
      <template #item="{ element }">
        <component
          v-bind="{ card: element }"
          :is="element.type === 'issue' ? 'board-issue-card' : 'board-card'"
          @edit="$emit('modal', { ...$event, id: board.id })"
        ></component>
      </template>
    </draggable>
  </div>
</template>
<script>
import { computed } from 'vue';
import Draggable from 'vuedraggable/src/vuedraggable';
import { useDialog } from '@/composable/dialog';
import Board from '@/models/board';
import Card from '@/models/card';
import BoardCard from './BoardCard.vue';
import BoardIssueCard from './BoardIssueCard.vue';

export default {
  components: { BoardCard, BoardIssueCard, Draggable },
  props: {
    board: {
      type: Object,
      default: () => ({}),
    },
    repository: {
      type: String,
      default: '',
    },
  },
  emits: ['modal'],
  setup(props) {
    const dialog = useDialog();

    const cards = computed({
      get() {
        return Card.query()
          .where('boardId', props.board.id)
          .orderBy('order')
          .get();
      },
      set(value) {
        const data = value.map((item, index) => ({ ...item, order: index }));
        console.log(data);
        Card.update({
          data,
        });
      },
    });

    function editBoard() {
      dialog.prompt({
        title: 'Edit board',
        label: 'Board name',
        input: props.board.name,
        okText: 'Save',
        onConfirm(value) {
          Board.update({
            where: props.board.id,
            data: {
              name: value,
            },
          });
        },
      });
    }
    function deleteBoard() {
      const confirm = window.confirm(
        `Are you sure you want to delete "${props.board.name}" board?`
      );

      if (confirm) {
        Board.delete(props.board.id);
      }
    }
    function onDragChange(event) {
      if (event.added) {
        Card.update({
          where: event.added.element.id,
          data: {
            order: event.added.newIndex,
            boardId: props.board.id,
          },
        });
      }
    }

    return {
      cards,
      editBoard,
      deleteBoard,
      onDragChange,
    };
  },
};
</script>
