import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';
import Board from './board';

class Project extends Model {
  static entity = 'projects';

  static primaryKey = 'id';

  static fields() {
    return {
      id: this.uid(() => nanoid()),
      name: this.string(''),
      path: this.string(''),
      rootId: this.attr(null),
      repository: this.string(''),
      starred: this.boolean(false),
      isMonorepo: this.boolean(false),
      createdAt: this.number(Date.now()),
      boards: this.hasMany(Board, 'projectId'),
    };
  }

  static afterDelete({ id, isMonorepo, workspaces }) {
    window.electron.ipcRenderer.callMain('remove-project-terminals', id);

    Board.delete(({ projectId }) => projectId === id);

    if (!isMonorepo) {
      this.delete((item) => item.isMonorepo && item.rootId === id);
    }
  }
}

export default Project;
