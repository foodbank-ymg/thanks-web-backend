export const managerStatus = {
  NONE: '初期状態',
  IDLE: '待機',
  INPUT_NAME: '名前入力',
  INPUT_RECIPIENT_ID: '団体ID入力',
} as const
export type managerStatusType = (typeof managerStatus)[keyof typeof managerStatus]

export const recipientStatus = {
  NONE: '初期状態',
  IDLE: '待機',
  INPUT_NAME: '名前入力',
  INPUT_RECIPIENT_ID: '団体ID入力',
} as const

export type recipientStatusType = (typeof recipientStatus)[keyof typeof recipientStatus]
