
import { bucket, upload } from './storage'
import { Post } from '../../types/post'

export const deletePostData = async (post: Post) => {
  await Promise.all(
    post.images.map((_, i) => bucket.file(`posts/${post.id}/${i + 1}.png`).delete()),
  )
}

export const uploadImage = async (image: Buffer, post: Post) => {
  const path = `posts/${post.id}/${post.images.length + 1}.png` //images haven't updated
  await upload(image, path)
  bucket.file(path).makePublic()
  return path
}
