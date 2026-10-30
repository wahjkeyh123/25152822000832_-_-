/**
 * 文件：src/ui/StoryPanel.js
 * 作用：结束本回合后弹出的小故事卡片。左边一块色板，右边写事，底下是结算后的加减。
 * 不是二选一。底下是「下一页」和「继续」，翻完这一串才关掉。
 */

import { COLORS, GAME_HEIGHT, GAME_WIDTH, STAT_LABEL, inkText } from '../config/constants.js';
import { SHEET_LABEL } from '../data/attributes.js';
import { STORY_LANE } from '../data/stories.js';
import { fillState, wrapChinese } from '../utils/text.js';
import TextButton from './components/TextButton.js';

const EXTRA_LABEL = { insight: '悟性', satisfaction: '满意度' };

export default class StoryPanel {
  constructor(scene, story, state, rolled, onDone, progress = {}) {
    this.scene = scene;
    this.objects = [];
    this.openedAt = scene.time.now;
    this.onDone = onDone;
    this.page = progress.page ?? 0;
    this.total = Math.max(1, progress.total ?? 1);
    this.last = this.page >= this.total - 1;

    const width = 920;
    const height = 520;
    const left = (GAME_WIDTH - width) / 2;
    const top = (GAME_HEIGHT - height) / 2;
    this.left = left;
    this.top = top;

    const dim = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.dim, 0.52);
    const zone = scene.add.zone(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT).setInteractive();
    zone.on('pointerup', (pointer, x, y, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });
    this.track(dim, 0);
    this.track(zone, 1);

    const paper = scene.add.graphics();
    paper.fillStyle(0x000000, 0.18);
    paper.fillRoundedRect(left + 8, top + 10, width, height, 18);
    paper.fillStyle(0xf6ead6, 1);
    paper.fillRoundedRect(left, top, width, height, 18);
    paper.lineStyle(3, 0xd7c4a6, 1);
    paper.strokeRoundedRect(left + 6, top + 6, width - 12, height - 12, 14);
    this.track(paper, 2);

    this.paintHeader(scene, left, top, width);
    this.paintArt(scene, story, left, top);
    this.paintBody(scene, story, state, left, top);
    this.paintPills(scene, rolled);
    if (rolled.insight) this.paintInsight(scene, rolled.insight, left, top);
    this.paintButtons(scene, left, top, width, height, onDone);
  }

  paintHeader(scene, left, top, width) {
    const head = scene.add.graphics();
    head.fillStyle(0xd45a3c, 1);
    head.fillRoundedRect(left, top, width, 64, 18);
    head.fillRect(left, top + 32, width, 32);
    this.track(head, 3);

    const dots = this.total;
    const span = Math.min(720, Math.max(80, (dots - 1) * 52));
    const gap = dots > 1 ? span / (dots - 1) : 0;
    const startX = left + width / 2 - span / 2;
    const gy = scene.add.graphics();
    if (dots > 1) {
      gy.lineStyle(4, 0xf3d0c4, 0.85);
      gy.lineBetween(startX, top + 32, startX + span, top + 32);
    }
    for (let i = 0; i < dots; i += 1) {
      const x = dots === 1 ? left + width / 2 : startX + i * gap;
      const reached = i <= this.page;
      const current = i === this.page;
      gy.fillStyle(reached ? 0xfff6e8 : 0xf3d0c4, 1);
      gy.fillCircle(x, top + 32, current ? 11 : 7);
      gy.lineStyle(3, 0xfff6e8, 1);
      gy.strokeCircle(x, top + 32, current ? 13 : 10);
    }
    this.track(gy, 4);
  }

  paintArt(scene, story, left, top) {
    const lane = STORY_LANE[story.lane] || STORY_LANE.daily;
    const x = left + 36;
    const y = top + 92;
    const w = 250;
    const h = 250;
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 0.7);
    g.fillRoundedRect(x - 4, y - 4, w + 8, h + 8, 22);
    g.fillStyle(lane.color, 1);
    g.fillRoundedRect(x, y, w, h, 20);
    this.doodle(g, story.lane, x, y, w, h);
    this.track(g, 4);
  }

  doodle(g, lane, x, y, w, h) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    g.lineStyle(5, 0x3b2616, 0.35);
    if (lane === 'play') {
      g.fillStyle(0xf2e27a, 1);
      g.fillCircle(cx, cy - 10, 42);
      g.fillStyle(0xd45a3c, 1);
      [0, 72, 144, 216, 288].forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        g.fillCircle(cx + Math.cos(rad) * 42, cy - 10 + Math.sin(rad) * 42, 10);
      });
    } else if (lane === 'study') {
      g.fillStyle(0xfff6e8, 0.95);
      g.fillRoundedRect(cx - 54, cy - 48, 108, 132, 8);
      g.lineStyle(3, 0x3b2616, 0.25);
      [-20, 0, 20, 40].forEach((yy) => g.lineBetween(cx - 38, cy + yy, cx + 38, cy + yy));
    } else if (lane === 'body') {
      g.fillStyle(0xfff6e8, 0.9);
      g.fillCircle(cx, cy - 36, 22);
      g.fillRoundedRect(cx - 28, cy - 10, 56, 70, 16);
    } else if (lane === 'home') {
      g.fillStyle(0xfff6e8, 0.95);
      g.fillTriangle(cx, cy - 70, cx - 70, cy - 8, cx + 70, cy - 8);
      g.fillRoundedRect(cx - 48, cy - 8, 96, 78, 6);
      g.fillStyle(0xd45a3c, 0.8);
      g.fillRect(cx - 12, cy + 22, 24, 48);
    } else {
      g.fillStyle(0xfff6e8, 0.55);
      g.fillCircle(cx + 40, cy - 48, 28);
      g.fillStyle(0x3b2616, 0.2);
      g.fillRoundedRect(cx - 70, cy + 30, 140, 18, 8);
    }
  }

  paintBody(scene, story, state, left, top) {
    const lane = STORY_LANE[story.lane] || STORY_LANE.daily;
    const x = left + 320;
    this.track(scene.add.text(x, top + 108, lane.label, inkText(22, lane.ink, { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    this.track(scene.add.text(x + 96, top + 108, story.title, inkText(28, '#3b2616', { fontStyle: 'bold' })).setOrigin(0, 0.5), 5);
    const rule = scene.add.graphics();
    rule.fillStyle(0xd7c4a6, 1);
    rule.fillRect(x, top + 128, 220, 3);
    this.track(rule, 5);
    const body = wrapChinese(fillState(story.text, state, { pal: story.pal }), 18);
    this.track(scene.add.text(x, top + 150, body, inkText(22, '#4a3424', {
      align: 'left',
      lineSpacing: 10,
    })).setOrigin(0, 0), 5);
  }

  paintPills(scene, rolled) {
    const items = [];
    Object.entries(rolled.sheet || {}).forEach(([key, value]) => {
      if (!value) return;
      items.push({ label: SHEET_LABEL[key] || key, value });
    });
    if (rolled.effects?.stress) items.push({ label: STAT_LABEL.stress, value: rolled.effects.stress });
    if (rolled.sat) items.push({ label: EXTRA_LABEL.satisfaction, value: rolled.sat });
    const startX = this.left + 320;
    const y = this.top + 348;
    items.slice(0, 4).forEach((item, index) => {
      const x = startX + (index % 3) * 168;
      const yy = y + Math.floor(index / 3) * 44;
      const good = item.label === STAT_LABEL.stress ? item.value < 0 : item.value > 0;
      const g = scene.add.graphics();
      g.fillStyle(good ? 0x5a4a8a : 0xa85a3a, 0.92);
      g.fillRoundedRect(x, yy, 152, 34, 16);
      this.track(g, 5);
      const sign = item.value > 0 ? '+' : '';
      this.track(scene.add.text(x + 76, yy + 17, `${item.label} ${sign}${item.value}`, inkText(16, '#fff8ee')).setOrigin(0.5), 6);
    });
    if (items.length === 0) {
      this.track(scene.add.text(startX, y + 8, '这一页很安静，什么也没变。', inkText(16, '#8a6a52')), 5);
    }
  }

  paintInsight(scene, insight, left, top) {
    const g = scene.add.graphics();
    g.fillStyle(0xf3d48a, 1);
    g.fillRoundedRect(left - 8, top + 118, 92, 64, 12);
    g.lineStyle(3, 0xc45c26, 1);
    g.strokeRoundedRect(left - 8, top + 118, 92, 64, 12);
    this.track(g, 7);
    this.track(scene.add.text(left + 38, top + 136, '悟性', inkText(16, '#8a4a22')).setOrigin(0.5), 8);
    this.track(scene.add.text(left + 38, top + 162, `+${insight}`, inkText(20, '#c45c26', { fontStyle: 'bold' })).setOrigin(0.5), 8);
  }

  paintButtons(scene, left, top, width, height, onDone) {
    const go = () => {
      if (scene.time.now - this.openedAt < 220) return;
      onDone();
    };
    const y = top + height - 42;
    if (this.last) {
      const cont = new TextButton(scene, left + width / 2, y, 220, 48, '继续', go, {
        fontSize: 20, depth: 206, color: 0xc45c26, hoverColor: 0xa84b1c,
      });
      this.objects.push(...cont.nodes());
      return;
    }
    const next = new TextButton(scene, left + width / 2 - 130, y, 200, 48, '下一页', go, {
      fontSize: 20, depth: 206, color: 0x5c4636, hoverColor: 0x3b2616,
    });
    const cont = new TextButton(scene, left + width / 2 + 130, y, 200, 48, '继续', go, {
      fontSize: 20, depth: 206, color: 0xc45c26, hoverColor: 0xa84b1c,
    });
    this.objects.push(...next.nodes(), ...cont.nodes());
  }

  track(obj, depth) {
    obj.setDepth(200 + depth);
    this.objects.push(obj);
    return obj;
  }

  destroy() {
    this.objects.forEach((obj) => obj.destroy());
    this.objects = [];
  }
}
