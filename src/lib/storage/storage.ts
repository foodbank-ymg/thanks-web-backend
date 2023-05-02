import { Bucket } from '@google-cloud/storage'
import admin from 'firebase-admin'

export var db: admin.storage.Storage | undefined
export var bucket: Bucket

export const newStorage = (projectId: string) => {
  if (db === undefined) {
    db = admin.storage()
    bucket = db.bucket(`gs://${projectId}.appspot.com`)
  }
}

export const upload = async (data: Buffer, path: string) => {
  //upload from memory
  await bucket.file(path).save(data)
}
