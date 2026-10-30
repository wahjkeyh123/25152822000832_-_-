/**
 * 文件：src/scenes/EndingScene.js
 * 作用：一局的终点，做成一张「结业证书」。
 * 左边是去向和故事，右边是七项属性（标出职业门槛）、高考分数和志向有没有实现。
 * 结局之后只能重开或回菜单，没有「永远玩下去」的出口。
 */

import { COLORS, GAME_HEIGHT, GAME_WIDTH, SCENE, inkText } from '../config/constants.js';
import { playSfx } from '../audio/AudioManager.js';
import BaseScene from '../core/BaseScene.js';
import GameState from '../core/GameState.js';
import { loadAlbum, rememberCareer, saveState } from '../core/SaveManager.js';
import { getDirection } from '../data/aspirations.js';
import { ATTRIBUTES, SHEET_LABEL } from '../data/attributes.js';
import { CAREERS, getCareer } from '../data/careers.js';
import { closestCareer, endingStory, getEnding } from '../systems/EndingSystem.js';
import { fadeInObjects } from '../effects/Motion.js';
import { addPortrait } from '../ui/childArt.js';
import TextButton from '../ui/components/TextButton.js';
import { WOOD, drawPaper, drawShadow } from '../ui/theme/frame.js';
import { fillName } from '../utils/text.js';

export default class EndingScene extends BaseScene {
  constructor() {
    super(SCENE.ENDING);
  }

  create() {
    if (!this.state || !this.state.endingId) {
      this.scene.start(SCENE.MENU);
      return;
    }

    const state = this.state;
    const ending = getEnding(state.endingId);
    const won = ending.result === 'win';
    const career = getCareer(state.career);
    const near = career ? null : closestCareer(state);
    const objects = [];
    const add = (obj) => {
      objects.push(obj);
      return obj;
    };

    const child = state.child;
    this.paintBackground(won);
    addPortrait(this, child, 'high', 222, 128, 50, 2).forEach((node) => add(node));
    add(this.add.text(GAME_WIDTH / 2, 76, '成 长 答 卷 · 结 业 证 书', inkText(20, '#8a5a36'))).setOrigin(0.5);
    add(this.add.text(GAME_WIDTH / 2, 124, career ? `${child.name}，成为了${career.name}` : `${child.name} · ${ending.title}`, inkText(42))).setOrigin(0.5);
    add(this.add.text(GAME_WIDTH / 2, 170, fillName(career ? `「${ending.title}」 ${career.line}` : this.subtitle(ending, near), child), inkText(18, COLORS.muted)))
      .setOrigin(0.5);
    this.paintSeal(1040, 112, won);

    if (career) rememberCareer(career.id);
    const story = endingStory(state);
    add(this.add.text(160, 218, story, inkText(17, COLORS.ink, {
      wordWrap: { width: 440, useAdvancedWrap: true },
      lineSpacing: 8,
    })));

    this.paintAlbum(160, 408);
    this.paintFacts(160, 468, state, career, near);
    this.paintBars(680, 222, state.child.sheet, career || near);

    new TextButton(this, 520, 620, 220, 56, '再来一局', () => this.again(), {
      fontSize: 22,
      color: 0x2f7d57,
      hoverColor: 0x256746,
    });
    new TextButton(this, 760, 620, 220, 56, '回主菜单', () => this.scene.start(SCENE.MENU), {
      fontSize: 22,
      color: 0x3d6ea8,
      hoverColor: 0x2f5684,
    });
    this.add.text(GAME_WIDTH / 2, 700, '上一局的存档不会再被「继续」。', inkText(14, '#e9d8bd')).setOrigin(0.5);

    fadeInObjects(this, objects, 420);
    playSfx(this, 'ending');
  }

  subtitle(ending, near) {
    if (ending.id === 'burnout') return '先把人照顾好，才谈得上去哪。';
    return near ? `差一点，就是${near.name}。` : '';
  }

  paintBackground(won) {
    const g = this.add.graphics();
    g.fillStyle(WOOD.dark, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.lineStyle(1, WOOD.grain, 0.5);
    for (let y = 12; y < GAME_HEIGHT; y += 18) g.lineBetween(0, y, GAME_WIDTH, y + 4);
    drawShadow(g, 110, 40, 1060, 640, 16, 0.35);
    drawPaper(g, 110, 40, 1060, 640, 16);
    const edge = won ? 0xc49a3a : 0x8a8f99;
    g.lineStyle(4, edge, 1);
    g.strokeRoundedRect(124, 54, 1032, 612, 12);
    g.lineStyle(1, edge, 0.8);
    g.strokeRoundedRect(132, 62, 1016, 596, 10);
    g.lineStyle(1, 0xdcc6a2, 1);
    g.lineBetween(640, 206, 640, 590);
  }

  /** 右上角一枚圆章：赢是红章，输是灰章。 */
  paintSeal(x, y, won) {
    const color = won ? 0xc0392b : 0x7d7f86;
    const g = this.add.graphics().setAngle(-12);
    g.setPosition(x, y);
    g.lineStyle(4, color, 0.85);
    g.strokeCircle(0, 0, 46);
    g.lineStyle(1.5, color, 0.85);
    g.strokeCircle(0, 0, 38);
    const text = this.add.text(x, y, won ? '赢' : '输', inkText(40, won ? '#c0392b' : '#7d7f86')).setOrigin(0.5).setAngle(-12);
    [g, text].forEach((obj) => obj.setScale(1.6).setAlpha(0));
    this.tweens.add({ targets: [g, text], scale: 1, alpha: 1, duration: 360, delay: 380, ease: 'Back.easeOut' });
  }

  paintAlbum(x, y) {
    const seen = loadAlbum();
    this.add.text(x, y, `去向图鉴  ${seen.length} / ${CAREERS.length}`, inkText(15, '#6b4b30', { fontStyle: 'bold' })).setOrigin(0, 0.5);
    CAREERS.forEach((career, index) => {
      const cx = x + (index % 8) * 54;
      const cy = y + 28;
      const got = seen.includes(career.id);
      const g = this.add.graphics();
      g.fillStyle(got ? 0xc45c26 : 0xe8d8c4, 1);
      g.fillRoundedRect(cx, cy - 12, 48, 24, 6);
      g.lineStyle(1, got ? 0xa84b1c : 0xd9c4a8, 1);
      g.strokeRoundedRect(cx, cy - 12, 48, 24, 6);
      this.add.text(cx + 24, cy, career.name.slice(0, 2), inkText(13, got ? '#fff8ee' : '#9a8a78')).setOrigin(0.5);
    });
  }

  paintFacts(x, y, state, career, near) {
    const exam = state.exam || { score: 0, comment: '' };
    const wanted = getCareer(state.aspiration?.career);
    const direction = getDirection(state.aspiration?.direction);
    let wish = '没有说过想做什么。';
    if (wanted) {
      wish = career && career.id === wanted.id
        ? `志向：${wanted.name}，实现了。`
        : `志向：${wanted.name}，没有实现。`;
    } else if (direction) {
      wish = `志向方向：${direction.label}。`;
    }
    const lines = [`高考 ${exam.score} 分。${exam.comment}`, wish];
    if (!career && near) {
      const gaps = Object.entries(near.needs)
        .filter(([key, need]) => (state.child.sheet[key] ?? 0) < need)
        .map(([key, need]) => `${SHEET_LABEL[key]}差 ${need - (state.child.sheet[key] ?? 0)}`);
      if (gaps.length > 0) lines.push(`离${near.name}：${gaps.join('，')}。`);
    }
    lines.push(`买过 ${state.books.length} 本职业书，学会 ${state.learnedSkills.length} 项技能。`);
    this.add.text(x, y, lines.join('\n'), inkText(16, COLORS.ink, {
      wordWrap: { width: 440, useAdvancedWrap: true },
      lineSpacing: 8,
    }));
  }

  /** 七条属性。target 是去向职业（或最接近的职业），在它看重的属性上画一道门槛线。 */
  paintBars(x, y, sheet, target) {
    this.add.text(x, y - 8, '最终属性', inkText(20)).setOrigin(0, 0.5);
    if (target) {
      this.add.text(x + 440, y - 8, `│ ${target.name}门槛`, inkText(14, '#a33b32')).setOrigin(1, 0.5);
    }
    const g = this.add.graphics();
    const width = 300;
    const peak = Math.max(...ATTRIBUTES.map((attr) => sheet[attr.key] ?? 0), ...Object.values(target?.needs || {}));
    const BAR_MAX = Math.max(80, Math.ceil((peak * 1.1) / 10) * 10);
    ATTRIBUTES.forEach((attr, index) => {
      const rowY = y + 32 + index * 44;
      const value = sheet[attr.key] ?? 0;
      this.add.text(x, rowY, attr.label, inkText(17)).setOrigin(0, 0.5);
      g.fillStyle(0xeadcc4, 1);
      g.fillRoundedRect(x + 76, rowY - 8, width, 16, 8);
      const fill = this.add.rectangle(x + 76, rowY, 0, 16, attr.color).setOrigin(0, 0.5);
      this.tweens.add({
        targets: fill,
        width: Math.max(4, width * Math.min(1, value / BAR_MAX)),
        duration: 600,
        delay: 200 + index * 70,
        ease: 'Cubic.easeOut',
      });
      this.add.text(x + 76 + width + 14, rowY, String(value), inkText(17)).setOrigin(0, 0.5);
      const need = target?.needs?.[attr.key];
      if (need) {
        const nx = x + 76 + width * Math.min(1, need / BAR_MAX);
        g.lineStyle(3, 0xa33b32, 1);
        g.lineBetween(nx, rowY - 13, nx, rowY + 13);
      }
    });
  }

  again() {
    const { name, gender } = this.state.child;
    const next = GameState.createNew({ name, gender });
    this.setState(next);
    saveState(next);
    this.scene.start(SCENE.GAME);
  }
}
