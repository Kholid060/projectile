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
    <div class="space-y-2 overflow-auto flex-1 scroll pb-4">
      <transition-group-list>
        <component
          v-bind="{ key: card.id, card }"
          v-for="card in board.cards"
          :is="card.type === 'issue' ? 'board-issue-card' : 'board-card'"
          :key="card.id"
          class="transition-list"
          @edit="$emit('modal', { ...$event, id: board.id })"
        ></component>
      </transition-group-list>
    </div>
  </div>
</template>
<script>
import { useDialog } from '@/composable/dialog';
import Board from '@/models/board';
import BoardCard from './BoardCard.vue';
import BoardIssueCard from './BoardIssueCard.vue';

export default {
  components: { BoardCard, BoardIssueCard },
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

    return {
      editBoard,
      deleteBoard,
    };
  },
};
</script>
