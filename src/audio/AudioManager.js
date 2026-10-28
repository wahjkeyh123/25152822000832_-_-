/**
 * 文件：src/audio/AudioManager.js
 * 作用：统一播放音效和背景音乐。仓库里没有音频文件时，所有调用都静默跳过，不会报错。
 *
 * 加声音只要把文件放进 assets/audio/，文件名就是键名，例如：
 *   click.mp3   按钮
 *   learn.mp3   学会技能
 *   dig.mp3     挖脑洞
 *   cloud.mp3   挖到乌云
 *   coin.mp3    积蓄变化（买书、打零工）
 *   stage.mp3   进入新时期
 *   ending.mp3  结局
 *   bgm.mp3     背景音乐（循环）
 * PreloadScene 会自动加载这个文件夹，不用改代码。
 */

const CLICK_KEY = 'click';
const BGM_KEY = 'bgm';

function has(scene, key) {
  return Boolean(scene?.cache?.audio?.exists(key));
}

export function playSfx(scene, key, volume = 0.7) {
  if (!has(scene, key)) return;
  scene.sound.play(key, { volume });
}

export function playClick(scene) {
  playSfx(scene, CLICK_KEY, 0.5);
}

/** 背景音乐只保留一条。换场景时不重新开始。 */
export function playBgm(scene, key = BGM_KEY, volume = 0.35) {
  if (!has(scene, key)) return;
  const playing = scene.sound.get(key);
  if (playing?.isPlaying) return;
  scene.sound.play(key, { loop: true, volume });
}

export function stopBgm(scene, key = BGM_KEY) {
  scene?.sound?.get(key)?.stop();
}
