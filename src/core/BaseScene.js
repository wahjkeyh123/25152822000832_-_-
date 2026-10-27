/**
 * 文件：src/core/BaseScene.js
 * 作用：所有场景的公共父类。
 * 从这里拿「这一局的数据」和「传话的桌子」，免得每个场景自己去翻 Phaser 的注册表。
 */

import Phaser from 'phaser';

export default class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  get bus() {
    return this.registry.get('bus');
  }

  get state() {
    return this.registry.get('state');
  }

  setState(next) {
    this.registry.set('state', next);
    return next;
  }
}
