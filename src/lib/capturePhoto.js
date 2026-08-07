/**
 * Opens the device camera and returns the captured photo as a File, ready to be
 * pushed through the normal Cloudinary upload path.
 *
 * Native (Capacitor) → uses the @capacitor/camera plugin.
 * Web               → returns null so the caller can fall back to the file picker.
 *
 * @returns {Promise<File|null>}
 */
export async function capturePhoto() {
  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return null

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    // Cloudinary downscales on upload anyway; capping here keeps the upload
    // small and fast on slow mobile connections.
    width: 1600,
    correctOrientation: true,
  })

  if (!photo?.webPath) return null

  // webPath is a local file:// URI exposed to the webview — read it into a File.
  const res  = await fetch(photo.webPath)
  const blob = await res.blob()
  const ext  = photo.format || 'jpeg'
  return new File([blob], `photo-${Date.now()}.${ext}`, { type: blob.type || `image/${ext}` })
}

/** True when the native camera is available (i.e. running inside the app). */
export async function isCameraAvailable() {
  try {
    const { Capacitor } = await import('@capacitor/core')
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}
