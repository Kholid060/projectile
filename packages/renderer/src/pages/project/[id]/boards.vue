<template>
  <div class="packages h-full flex flex-col container">
    <div class="flex items-center mb-8">
      <h2 class="text-2xl font-semibold text-overflow">Boards</h2>
      <div class="flex-grow"></div>
      <ui-button variant="primary" @click="addBoard">
        <v-mdi name="mdi-plus" class="mr-1 -ml-2"></v-mdi>
        <span>Board</span>
      </ui-button>
    </div>
    <p v-if="boards.length === 0" class="text-center text-gray-200">
      You have no boards
    </p>
    <template v-else>
      <div
        class="flex space-x-6 scroll pb-4 overflow-auto"
        style="height: calc(100vh - 6.5rem)"
      >
        <board-column
          v-for="board in boards"
          v-bind="{ key: board.id, board, repository: project.repository }"
          :key="board.id"
          @modal="showModal"
        ></board-column>
      </div>
    </template>
    <ui-modal v-model="modalState.show" position="items-start">
      <template #header>
        <p>{{ modalState.type === 'issue' ? 'Add Issue Card' : 'Add Card' }}</p>
      </template>
      <component
        :is="modalState.type === 'issue' ? 'AddIssueCard' : 'AddCard'"
        :board-id="modalState.boardId"
        :data="modalState.data"
        :repository="project.repository"
        @save="saveAndClose"
      ></component>
    </ui-modal>
  </div>
</template>
<script>
import { computed, shallowReactive } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useDialog } from '@/composable/dialog';
import Board from '@/models/board';
import AddCard from '@/components/boards/AddCard.vue';
import BoardColumn from '@/components/boards/BoardColumn.vue';
import AddIssueCard from '@/components/boards/AddIssueCard.vue';

export default {
  components: { AddCard, AddIssueCard, BoardColumn },
  props: {
    packageJSON: {
      type: Object,
      default: () => ({}),
    },
    project: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const dialog = useDialog();

    const modalState = shallowReactive({
      show: false,
      type: '',
      data: null,
      boardId: '',
    });

    const boards = computed(() =>
      Board.query().where('projectId', route.params.id).with('cards').get()
    );

    function addBoard() {
      dialog.prompt({
        title: 'Add board',
        label: 'Board name',
        onConfirm(name) {
          Board.insert({
            data: {
              name,
              projectId: route.params.id,
            },
          });
          store.dispatch('saveToStorage', 'boards');
        },
      });
    }
    function showModal({ type, id, data }) {
      modalState.show = true;
      modalState.type = type;
      modalState.boardId = id;
      modalState.data = data;
    }
    function saveAndClose() {
      modalState.show = false;
      modalState.type = '';
      modalState.boardId = '';
      modalState.data = null;
      store.dispatch('saveToStorage', 'cards');
    }

    return {
      boards,
      addBoard,
      showModal,
      modalState,
      saveAndClose,
    };
  },
};
</script>
