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
      repository: this.string(''),
      createdAt: this.number(Date.now()),
      starred: this.boolean(false),
      boards: this.hasMany(Board, 'projectId'),
    };
  }

  static afterDelete(model) {
    console.log(model, 'ro')
  }
}

export default Project;
