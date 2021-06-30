import { Model } from '@vuex-orm/core';
import { nanoid } from 'nanoid';

class Card extends Model {
  static entity = 'cards';

  static primaryKey = 'id';

  static fields() {
    return {
      id: this.uid(() => nanoid()),
      name: this.string(''),
      type: this.string(''),
      data: this.attr(null),
      boardId: this.attr(null),
      description: this.string(''),
    };
  }
}

export default Card;
