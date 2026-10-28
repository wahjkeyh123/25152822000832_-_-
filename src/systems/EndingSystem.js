/**
 * 文件：src/systems/EndingSystem.js
 * 作用：高中结束后决定大结局，以及落在哪个职业上。
 * 顺序：崩溃 → 志向职业够格 → 别的职业够格 → 都不够。
 * 改职业门槛去 src/data/careers.js，改结局文字去 src/data/endings.js。
 */

import { CAREERS, careerGap, careerMargin, getCareer, meetsCareer } from '../data/careers.js';
import { ENDINGS, isBurnout } from '../data/endings.js';

export function judgeEnding(state) {
  const sheet = state.child.sheet;
  const examScore = state.exam?.score ?? 0;
  if (isBurnout(state.child.stats)) return { endingId: 'burnout', careerId: null };

  const wanted = getCareer(state.aspiration?.career);
  if (wanted && meetsCareer(wanted, sheet, examScore)) {
    return { endingId: 'dream', careerId: wanted.id };
  }

  const fit = CAREERS
    .filter((career) => meetsCareer(career, sheet, examScore))
    .sort((a, b) => careerMargin(b, sheet) - careerMargin(a, sheet));
  if (fit.length > 0) return { endingId: 'detour', careerId: fit[0].id };

  return { endingId: 'drift', careerId: null };
}

/** 一个职业都不够时，最接近的是哪个。结局页用它说「差一点就是……」。 */
export function closestCareer(state) {
  const sheet = state.child.sheet;
  return [...CAREERS].sort((a, b) => careerGap(a, sheet) - careerGap(b, sheet))[0];
}

export function getEnding(id) {
  return ENDINGS.find((ending) => ending.id === id) || ENDINGS[ENDINGS.length - 1];
}
