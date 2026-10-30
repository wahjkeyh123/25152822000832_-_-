/**
 * 文件：src/ui/StageIntro.js
 * 作用：开局和每次换时期时的过场。整屏显示新时期的背景、孩子这个时期的新形象、一句话和回合数。
 * 点任意处继续。
 */

import { GAME_HEIGHT, GAME_WIDTH, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';
import { getStage } from '../data/stages.js';
import { fillName } from '../utils/text.js';
import { childArtKey } from './childArt.js';
import { frameRoomPhoto } from './RoomBackdrop.js';

const DEPTH = 300;

export default class StageIntro {
  constructor(scene, state, onDone) {
    this.scene = scene;
    this.objects = [];
    this.closing = false;
    this.openedAt = scene.time.now;
    const stage = getStage(state.yearIndex);
    const child = state.child;

    const add = (obj, offset = 0) => {
      obj.setDepth(DEPTH + offset);
      this.objects.push(obj);
      return obj;
    };

    add(scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a140f, 1));
    const bgKey = `bg-${stage.id}`;
    if (scene.textures.exists(bgKey)) {
      const photo = add(scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgKey), 1);
      frameRoomPhoto(photo, stage.id);
      photo.setScale(photo.scale * 1.04);
      this.photo = photo;
    }
    const shade = add(scene.add.graphics(), 2);
    shade.fillStyle(0x1a140f, 0.35);
    shade.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    shade.fillGradientStyle(0x1a140f, 0x1a140f, 0x1a140f, 0x1a140f, 0, 0.92, 0, 0.92);
    shade.fillRect(560, 0, GAME_WIDTH - 560, GAME_HEIGHT);

    const artKey = childArtKey(scene, child, stage.id);
    if (artKey) {
      const glow = add(scene.add.ellipse(360, 640, 380, 70, 0x000000, 0.22), 3);
      const art = add(scene.add.image(360, 650, artKey).setOrigin(0.5, 1), 4);
      art.setScale(Math.min(560 / art.height, 420 / art.width));
      this.art = art;
      this.glow = glow;
    }

    const x = 700;
    add(scene.add.text(x, 150, `第 ${stage.index + 1} 个时期`, inkText(20, '#f3d48a')).setOrigin(0, 0.5), 5);
    this.title = add(scene.add.text(x, 220, stage.grade, inkText(76, '#fff6e6', {
      fontStyle: 'bold',
      stroke: '#3b2616',
      strokeThickness: 8,
    })).setOrigin(0, 0.5), 5);
    add(scene.add.text(x, 296, `${child.name} · ${child.gender === 'girl' ? '女孩' : '男孩'} · ${stage.age} 岁`, inkText(26, '#f6e7c1')).setOrigin(0, 0.5), 5);
    const line = add(scene.add.graphics(), 5);
    line.fillStyle(0xe2b656, 1);
    line.fillRect(x, 330, 300, 4);
    add(scene.add.text(x, 356, fillName(stage.blurb, child), inkText(20, '#fff6e6', {
      lineSpacing: 10,
      wordWrap: { width: 500, useAdvancedWrap: true },
    })).setOrigin(0, 0), 5);

    const facts = [`这一期 ${stage.rounds} 个回合，每回合排 6 个技能`];
    if (stage.expect) facts.push(`期望「${stage.expect.title}」：${SHEET_LABEL[stage.expect.key]}到 ${stage.expect.target}`);
    if (stage.allowance) facts.push(`家里进账 ${stage.allowance} 元`);
    add(scene.add.text(x, 478, facts.map((item) => `· ${item}`).join('\n'), inkText(17, '#d9c4a4', {
      lineSpacing: 10,
    })).setOrigin(0, 0), 5);

    this.hint = add(scene.add.text(GAME_WIDTH / 2 + 300, 664, '点任意处继续', inkText(18, '#f3d48a')).setOrigin(0.5), 5);
    scene.tweens.add({ targets: this.hint, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    const zone = add(scene.add.zone(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT).setInteractive({ useHandCursor: true }), 10);
    zone.on('pointerup', (pointer, localX, localY, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (scene.time.now - this.openedAt < 450) return;
      this.close(onDone);
    });

    const fading = this.visible();
    fading.forEach((obj) => obj.setAlpha(0));
    scene.tweens.add({ targets: fading.filter((obj) => obj !== this.hint), alpha: 1, duration: 360 });
    this.hint.setAlpha(1);
    if (this.photo) {
      const end = this.photo.scale / 1.04;
      scene.tweens.add({ targets: this.photo, scale: end, duration: 2600, ease: 'Sine.easeOut' });
    }
    if (this.art) {
      const y = this.art.y;
      this.art.y += 40;
      scene.tweens.add({ targets: this.art, y, duration: 520, ease: 'Back.easeOut', delay: 120 });
    }
    if (this.title) {
      this.title.x += 40;
      scene.tweens.add({ targets: this.title, x: x, duration: 420, ease: 'Cubic.easeOut', delay: 80 });
    }
  }

  close(onDone) {
    if (this.closing) return;
    this.closing = true;
    this.scene.tweens.add({
      targets: this.visible(),
      alpha: 0,
      duration: 260,
      onComplete: () => {
        this.destroy();
        onDone?.();
      },
    });
  }

  /** Zone 没有真正的透明度，参与补间会报错，所以只挑看得见的。 */
  visible() {
    return this.objects.filter((obj) => typeof obj.alpha === 'number');
  }

  destroy() {
    this.objects.forEach((obj) => {
      this.scene.tweens.killTweensOf(obj);
      obj.destroy();
    });
    this.objects = [];
  }
}
