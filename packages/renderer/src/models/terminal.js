import { Model } from '@vuex-orm/core';

class Terminal extends Model {
  static entity = 'terminals'

  static primaryKey = 'name'

  static fields() {
    return {
      name: this.string(''),
      log: this.string(''),
      status: this.string(''),
    };
  }
}

export default Terminal;
