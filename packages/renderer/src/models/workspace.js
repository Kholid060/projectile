import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';

class Workspace extends Model {
  static entity = 'workspaces'

  static primaryKey = 'id'

  static fields() {
    return {
      id: this.uid(() => nanoid()),
      name: this.string(''),
      path: this.string(''),
      projectId: this.attr(null),
    };
  }
}

export default Workspace;
