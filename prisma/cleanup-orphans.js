/**
 * Finds Cloudinary assets in the gem-market folders that no listing references
 * and (optionally) deletes them. Assets younger than 1 hour are skipped so
 * in-progress uploads are never removed.
 *
 *   node prisma/cleanup-orphans.js            # dry run — lists orphans only
 *   node prisma/cleanup-orphans.js --delete   # actually deletes them
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()               // also loads .env into process.env
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const DELETE  = process.argv.includes('--delete')
const AGE_MS  = 60 * 60 * 1000 // don't touch anything uploaded in the last hour

// .../upload/v123/gem-market/listings/abc.jpg  ->  gem-market/listings/abc
function publicIdFromUrl(url) {
  if (!url) return null
  const m = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i)
  return m ? m[1] : null
}

async function referencedPublicIds() {
  const [imgs, vids] = await Promise.all([
    prisma.image.findMany({ select: { imageUrl: true, publicId: true } }),
    prisma.video.findMany({ select: { videoUrl: true, publicId: true } }),
  ])
  const set = new Set()
  for (const i of imgs) {
    if (i.publicId) set.add(i.publicId)
    const p = publicIdFromUrl(i.imageUrl); if (p) set.add(p)
  }
  for (const v of vids) {
    if (v.publicId) set.add(v.publicId)
    const p = publicIdFromUrl(v.videoUrl); if (p) set.add(p)
  }
  return set
}

async function listAll(prefix, resourceType) {
  let all = [], cursor
  do {
    const res = await cloudinary.api.resources({
      type: 'upload', prefix, resource_type: resourceType, max_results: 500, next_cursor: cursor,
    })
    all = all.concat(res.resources)
    cursor = res.next_cursor
  } while (cursor)
  return all
}

async function main() {
  const referenced = await referencedPublicIds()
  console.log(`Referenced assets in DB: ${referenced.size}`)

  const cutoff  = Date.now() - AGE_MS
  const folders = [
    { prefix: 'gem-market/listings', rt: 'image' },
    { prefix: 'gem-market/videos',   rt: 'video' },
  ]

  let orphans = 0, deleted = 0, bytes = 0
  for (const f of folders) {
    const resources = await listAll(f.prefix, f.rt)
    for (const r of resources) {
      if (referenced.has(r.public_id)) continue
      if (new Date(r.created_at).getTime() > cutoff) continue // too new — may be in progress
      orphans++
      bytes += r.bytes || 0
      console.log(`${DELETE ? 'DELETING' : 'ORPHAN'}  ${f.rt.padEnd(5)}  ${r.public_id}  (${Math.round((r.bytes || 0) / 1024)} KB, ${r.created_at})`)
      if (DELETE) {
        await cloudinary.uploader.destroy(r.public_id, { resource_type: f.rt })
        deleted++
      }
    }
  }

  console.log(`\n${orphans} orphan(s), ${(bytes / 1024 / 1024).toFixed(1)} MB total.`)
  console.log(DELETE ? `Deleted ${deleted}.` : 'Dry run — re-run with --delete to remove them.')
}

main()
  .catch((e) => { console.error('Cleanup failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
