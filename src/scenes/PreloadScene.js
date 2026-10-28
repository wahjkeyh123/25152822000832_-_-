/**
 * 文件：src/scenes/PreloadScene.js
 * 作用：加载页。把 assets/ 里的图片和音频全部读进来，进度条是真的。
 * 文件夹和键名的对应关系：
 * - assets/images/icons/iq.png        → iq（属性图标）
 * - assets/images/bg/middle.jpg       → bg-middle（初中的房间背景）
 * - assets/images/child/girl-high.jpg → child-girl-high（高中女孩）
 * - assets/audio/click.mp3            → click
 */

import { COLORS, GAME_TITLE, GAME_WIDTH, SCENE, inkText } from '../config/constants.js';
import BaseScene from '../core/BaseScene.js';
import { cutoutChildren, trimLoadedIcons } from '../ui/trimIcons.js';

const fileKey = (path) => (path.split(/[/\\]/).pop() || '').replace(/\.\w+$/, '');

export default class PreloadScene extends BaseScene {
  constructor() {
    super(SCENE.PRELOAD);
  }

  preload() {
    const sounds = import.meta.glob('../../assets/audio/*.{mp3,ogg,wav}', { eager: true, import: 'default' });
    Object.entries(sounds).forEach(([path, url]) => this.load.audio(fileKey(path), url));

    const icons = import.meta.glob('../../assets/images/icons/*.{png,jpg,webp}', { eager: true, import: 'default' });
    Object.entries(icons).forEach(([path, url]) => this.load.image(fileKey(path), url));

    const rooms = import.meta.glob('../../assets/images/bg/*.{png,jpg,webp}', { eager: true, import: 'default' });
    Object.entries(rooms).forEach(([path, url]) => this.load.image(`bg-${fileKey(path)}`, url));

    const children = import.meta.glob('../../assets/images/child/*.{png,jpg,webp}', { eager: true, import: 'default' });
    Object.entries(children).forEach(([path, url]) => this.load.image(`child-${fileKey(path)}`, url));

    this.bar = this.add.graphics();
    this.add.text(GAME_WIDTH / 2, 280, GAME_TITLE, inkText(48, COLORS.ink)).setOrigin(0.5);
    this.hint = this.add.text(GAME_WIDTH / 2, 360, '正在整理答卷…', inkText(20, COLORS.muted)).setOrigin(0.5);
    this.load.on('progress', (value) => this.drawBar(value));
  }

  create() {
    this.drawBar(1);
    trimLoadedIcons(this);
    cutoutChildren(this);
    this.hint.setText('可以开始了');
    this.time.delayedCall(280, () => this.scene.start(SCENE.MENU));
  }

  drawBar(value) {
    const width = 420;
    const x = GAME_WIDTH / 2 - width / 2;
    const y = 420;
    this.bar.clear();
    this.bar.fillStyle(0xe6d3ba, 1);
    this.bar.fillRoundedRect(x, y, width, 16, 8);
    this.bar.fillStyle(0xc45c26, 1);
    this.bar.fillRoundedRect(x, y, Math.max(16, width * value), 16, 8);
  }
}
