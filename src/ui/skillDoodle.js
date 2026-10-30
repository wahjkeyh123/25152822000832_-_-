/**
 * 文件：src/ui/skillDoodle.js
 * 作用：右侧技能卡左边那块简笔画。没有单独的 png，按技能 id 画一小幅。
 */

import { attributeByKey } from '../data/attributes.js';
import { mainEffect } from '../data/skills.js';

export function paintSkillDoodle(scene, skill, x, y, size, depth = 6) {
  const g = scene.add.graphics().setDepth(depth);
  const main = mainEffect(skill);
  const attr = main ? attributeByKey(main.key) : null;
  const paper = attr ? mix(attr.color, 0xfff6e8, 0.55) : 0xfff1dc;
  const ink = 0x4a3424;
  const r = size / 2;
  g.fillStyle(paper, 1);
  g.fillRoundedRect(x - r, y - r, size, size, 10);
  g.lineStyle(2, 0xe2d2bc, 1);
  g.strokeRoundedRect(x - r, y - r, size, size, 10);
  drawMark(g, skill.id, x, y, r - 6, ink, attr?.color ?? 0xc45c26);
  return g;
}

function mix(color, other, t) {
  const split = (value) => [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const a = split(color);
  const b = split(other);
  const r = Math.round(a[0] * (1 - t) + b[0] * t);
  const g = Math.round(a[1] * (1 - t) + b[1] * t);
  const bl = Math.round(a[2] * (1 - t) + b[2] * t);
  return (r << 16) + (g << 8) + bl;
}

function drawMark(g, id, x, y, r, ink, accent) {
  g.lineStyle(3, ink, 0.85);
  g.fillStyle(accent, 0.95);
  if (['grab', 'point', 'first-aid', 'grab-self', 'roll-move', 'sit-up', 'crawl-to'].includes(id) || id === 'reach') {
    g.fillCircle(x + 4, y - 2, r * 0.42);
    g.lineBetween(x - r * 0.2, y + r * 0.15, x + r * 0.55, y + r * 0.55);
    return;
  }
  if (['sounds', 'listening', 'radio', 'sound-find', 'water-play', 'headphone-rest', 'listen-talk'].includes(id)) {
    g.strokeCircle(x - 4, y, r * 0.28);
    g.beginPath();
    g.arc(x - 4, y, r * 0.55, -0.6, 0.6, false);
    g.strokePath();
    g.beginPath();
    g.arc(x - 4, y, r * 0.78, -0.6, 0.6, false);
    g.strokePath();
    return;
  }
  if (['call', 'peekaboo', 'say-it', 'speech', 'mirror-host', 'eye-meet', 'call-back', 'hide-face', 'look-mirror', 'clap-along', 'know-face', 'full-tell', 'simple-tell', 'peer-talk', 'peer-chat', 'speak-out', 'timed-speak', 'collab-align', 'conflict-handle', 'field-decide', 'peer-work'].includes(id)) {
    g.fillRoundedRect(x - r * 0.55, y - r * 0.45, r * 1.1, r * 0.7, 6);
    g.fillTriangle(x - 4, y + r * 0.2, x + 10, y + r * 0.2, x, y + r * 0.62);
    return;
  }
  if (['letters', 'chinese', 'essay', 'composition', 'gaokao-essay', 'thick-book', 'clauses', 'lesson-plan', 'name-point', 'pic-word', 'watch-move', 'read-close', 'para-sum', 'compare-read', 'write-org', 'write-long', 'error-look', 'error-file', 'error-rework', 'industry-read', 'arg-break', 'issue-map', 'judge-alone', 'note-margin', 'synth-essay', 'topic-survey', 'choice-scan', 'review-done', 'pro-judge'].includes(id)) {
    g.fillStyle(0xfff8ee, 1);
    g.fillRoundedRect(x - r * 0.45, y - r * 0.55, r * 0.9, r * 1.15, 3);
    g.lineStyle(2, ink, 0.5);
    [-8, 2, 12].forEach((yy) => g.lineBetween(x - r * 0.28, y + yy, x + r * 0.28, y + yy));
    return;
  }
  if (['count', 'math', 'algebra', 'review', 'formula', 'lab-notes', 'contest', 'qty-feel', 'num-sense', 'step-list', 'rel-model', 'qty-check', 'timed-solve', 'plan-land', 'method-shift', 'need-clear'].includes(id)) {
    g.lineBetween(x - r * 0.4, y, x + r * 0.4, y);
    g.lineBetween(x, y - r * 0.4, x, y + r * 0.4);
    g.strokeCircle(x, y, r * 0.62);
    return;
  }
  if (['yard', 'pe', 'ball', 'laps', 'training', 'match', 'jump-rope', 'outdoor-pace', 'recess-move', 'load-sense', 'load-manage', 'stress-reset', 'rest-bound', 'pace-reset', 'yard-stroll', 'downstairs-walk', 'night-walk'].includes(id)) {
    g.fillCircle(x, y, r * 0.62);
    g.fillStyle(0xfff8ee, 0.35);
    g.fillCircle(x - r * 0.18, y - r * 0.18, r * 0.2);
    return;
  }
  if (['draw', 'art', 'colors', 'sketch', 'redo-room', 'material-form', 'sense-log', 'form-judge', 'role-play', 'doodle-free'].includes(id)) {
    g.fillCircle(x - 8, y - 4, r * 0.28);
    g.fillStyle(0x3d9a4a, 0.9);
    g.fillCircle(x + 8, y - 6, r * 0.24);
    g.fillStyle(0x3aa0e0, 0.9);
    g.fillCircle(x, y + 10, r * 0.26);
    return;
  }
  if (['fold', 'english', 'short-story'].includes(id)) {
    g.fillTriangle(x, y - r * 0.5, x - r * 0.55, y + r * 0.4, x + r * 0.55, y + r * 0.4);
    return;
  }
  if (['rhyme', 'weekend-blank'].includes(id)) {
    g.fillCircle(x - 6, y + 8, r * 0.22);
    g.fillCircle(x + 10, y + 4, r * 0.18);
    g.lineBetween(x - 2, y + 8, x - 2, y - 12);
    g.lineBetween(x + 14, y + 4, x + 14, y - 16);
    g.lineBetween(x - 2, y - 12, x + 14, y - 16);
    return;
  }
  if (['lab', 'body-map'].includes(id)) {
    g.fillRoundedRect(x - 8, y - 4, 16, 22, 3);
    g.fillCircle(x, y - 10, 10);
    return;
  }
  if (['parttime', 'duty', 'wait-line', 'rule-nudge', 'soothe-pace'].includes(id)) {
    g.fillCircle(x, y, r * 0.7);
    g.lineStyle(2, 0xc9952d, 1);
    g.strokeCircle(x, y, r * 0.38);
    return;
  }
  g.fillCircle(x, y - 6, r * 0.38);
  g.fillRoundedRect(x - r * 0.42, y + 2, r * 0.84, r * 0.55, 8);
}
