export const managerStatus = {
  NONE: '初期状態',
  IDLE: '待機',
  INPUT_NAME: '名前入力',
  CONFIRM_NAME: '名前確認',
  INPUT_STATION_ID: '拠点ID入力',
  DELETE_POST: 'おたより削除',
} as const
export type managerStatusType = (typeof managerStatus)[keyof typeof managerStatus]

export const recipientStatus = {
  NONE: '初期状態',
  IDLE: '待機',
  INPUT_NAME: '名前入力',
  CONFIRM_NAME: '名前確認',
  INPUT_RECIPIENT_ID: '団体ID入力',
  INPUT_POST: 'おたより入力',
} as const

export type recipientStatusType = (typeof recipientStatus)[keyof typeof recipientStatus]

export const postStatus = {
  INPUT_IMAGE: '画像添付',
  // CONFIRM_IMAGE: '画像確認',
  INPUT_SUBJECT: '主題入力',
  CONFIRM_SUBJECT: '主題確認',
  INPUT_BODY: '本文入力',
  CONFIRM_BODY: '本文確認',
  CONFIRM_SUBMIT: '送信確認',
  WAITING_REVIEW: '確認待ち',
  APPROVED: '承認済み',
  REJECTED: '却下済み',
}

export type postStatusType = (typeof postStatus)[keyof typeof postStatus]
