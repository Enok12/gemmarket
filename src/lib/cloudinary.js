import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file, folder = 'gem-market') {
  const src =
    typeof file === 'string'
      ? file
      : `data:image/jpeg;base64,${file.toString('base64')}`

  const result = await cloudinary.uploader.upload(src, {
    folder,
    resource_type: 'image',
    transformation: [
      {
        width:        1200,
        height:       900,
        crop:         'limit',
        quality:      'auto:good',
        fetch_format: 'auto',
      },
    ],
  })

  return { url: result.secure_url, publicId: result.public_id }
}

export async function uploadVideo(file, folder = 'gem-market/videos') {
  const src =
    typeof file === 'string'
      ? file
      : `data:video/mp4;base64,${file.toString('base64')}`

  const result = await cloudinary.uploader.upload(src, {
    folder,
    resource_type: 'video',
    transformation: [
      { quality: 'auto:good' },
    ],
  })

  return { url: result.secure_url, publicId: result.public_id }
}

export async function deleteImage(publicId) {
  await cloudinary.uploader.destroy(publicId)
}

export async function deleteVideo(publicId) {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
}

export default cloudinary