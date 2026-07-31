/**
 * Uploads a file directly to Cloudinary (bypassing Vercel's function size limit).
 *
 * 1. Fetches a short-lived signature from our own /api/upload/sign.
 * 2. Uploads the file straight to Cloudinary via XMLHttpRequest so we get
 *    real upload-progress events (plain fetch can't report upload progress).
 *
 * @param {File}   file
 * @param {object} opts
 * @param {'image'|'video'} opts.type
 * @param {string} opts.token       - JWT for the sign request
 * @param {(percent:number)=>void} opts.onProgress - 0..100
 * @returns {Promise<{url:string, publicId:string}>}
 */
export async function uploadToCloudinary(file, { type = 'image', token, onProgress } = {}) {
  // 1. Get a signature (tiny request — never hits Vercel's body limit)
  const signRes = await fetch('/api/upload/sign', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body:    JSON.stringify({ type }),
  })
  const signJson = await signRes.json()
  if (!signJson.success) throw new Error(signJson.error || 'Could not prepare upload')

  const { signature, timestamp, folder, transformation, apiKey, cloudName, resourceType } = signJson.data

  // 2. Upload directly to Cloudinary with progress reporting
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', apiKey)
    form.append('timestamp', timestamp)
    form.append('signature', signature)
    form.append('folder', folder)
    if (transformation) form.append('transformation', transformation)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText)
        if (res.secure_url) resolve({ url: res.secure_url, publicId: res.public_id })
        else reject(new Error(res.error?.message || 'Upload failed'))
      } catch {
        reject(new Error('Upload failed'))
      }
    }
    xhr.onerror   = () => reject(new Error('Upload failed — check your connection'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.send(form)
  })
}
