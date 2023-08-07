import { keyword } from './keyword'

//phrases that frequently used in the project
export const phrase = {
  systemError: 'システムでエラーが発生しました。',
  dontHaveMessage: 'メッセージがありません。',
  yesOrNo: `「${keyword.YES}」か「${keyword.NO}」で回答をお願いします。`,
  aOrb: (a: string, b: string) => `「${a}」か「${b}」で回答をお願いします。`,
}
