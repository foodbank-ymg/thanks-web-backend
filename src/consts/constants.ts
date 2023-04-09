export const status = {
  none: '初期状態',
  idle: '待機',
  inputName: '名前入力',
} as const

export type statusType = (typeof status)[keyof typeof status]
