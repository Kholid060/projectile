import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';
import Card from './card';

class Board extends Model {
  static entity = 'boards';

  static primaryKey = 'id';

  static fields() {
    return {
      id: this.uid(() => nanoid()),
      name: this.string(''),
      projectId: this.attr(null),
      cards: this.hasMany(Card, 'boardId'),
      createdAt: this.number(Date.now()),
    };
  }
}

export default Board;
