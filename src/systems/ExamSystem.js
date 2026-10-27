/**
 * 文件：src/systems/ExamSystem.js
 * 作用：高中结束时，把属性折算成一个高考分数，给结局页看。
 * 分数是结果的展示。真正决定赢输的是 EndingSystem，因为「人还在不在」也要算。
 */

import clamp from '../utils/clamp.js';

export function gradeExam(state) {
  const stats = state.child.stats;
  if (stats.stress >= 90 || stats.mood <= 20) {
    return { score: 0, comment: '没能走进高考考场。' };
  }

  const raw = stats.study * 0.7
    + stats.mood * 0.15
    + stats.body * 0.15
    - Math.max(0, stats.stress - 40) * 0.25;
  const score = clamp(Math.round(raw), 0, 100);
  return { score, comment: commentFor(score) };
}

function commentFor(score) {
  if (score >= 85) return '名次很靠前。';
  if (score >= 70) return '稳稳过了线。';
  if (score >= 60) return '擦着线过去了。';
  return '没到这所学校的录取线。';
}
