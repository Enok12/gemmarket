import { prisma } from './prisma'

/**
 * Returns the next sequential GGMP item code, e.g. "GGMP1386".
 * Reads the highest existing numeric suffix so codes never collide
 * with the backfilled ones.
 */
export async function generateItemCode() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT COALESCE(MAX(CAST(SUBSTRING("itemCode" FROM 5) AS INTEGER)), 1000) AS max
    FROM "Listing"
    WHERE "itemCode" ~ '^GGMP[0-9]+$'
  `)
  return `GGMP${Number(rows[0].max) + 1}`
}
