/**
 * 文件：src/systems/ExamSystem.js
 * 作用：高中最后一回合结束时，把属性折算成一个高考分数，给结局页看。
 * 主要看智商和记忆力，心情和体魄占一点，压力太高会扣分。
 * 分数是结果的展示。真正决定赢输的是 EndingSystem，因为「人还在不在」也要算。
 */

import { isBurnout } from '../data/endings.js';
import clamp from '../utils/clamp.js';

/** 智商和记忆力平均到这个数，知识分就拿满。 */
const KNOWLEDGE_FULL = 130;

export function gradeExam(state) {
  const stats = state.child.stats;
  const sheet = state.child.sheet;
  if (isBurnout(stats)) {
    return { score: 0, comment: '没能走进高考考场。' };
  }
  const knowledge = Math.min(1, ((sheet.iq ?? 0) + (sheet.memory ?? 0)) / 2 / KNOWLEDGE_FULL);
  const raw = knowledge * 78
    + stats.mood * 0.12
    + Math.min(1, (sheet.physique ?? 0) / 120) * 10
    - Math.max(0, stats.stress - 60) * 0.4;
  const score = clamp(Math.round(raw), 0, 100);
  return { score, comment: commentFor(score) };
}

function commentFor(score) {
  if (score >= 85) return '名次很靠前。';
  if (score >= 70) return '稳稳过了线。';
  if (score >= 60) return '擦着线过去了。';
  return '没到这所学校的录取线。';
}
