/**
 * Backfill: assign a unique GGMP item code to every listing that lacks one.
 * Codes are assigned sequentially by creation date, continuing from the
 * highest existing GGMP number so the script is safe to re-run.
 *
 *   node prisma/backfill-item-codes.js
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Highest existing GGMP number (defaults to 1000 => first code is GGMP1001)
  const rows = await prisma.$queryRawUnsafe(`
    SELECT COALESCE(MAX(CAST(SUBSTRING("itemCode" FROM 5) AS INTEGER)), 1000) AS max
    FROM "Listing"
    WHERE "itemCode" ~ '^GGMP[0-9]+$'
  `)
  const start = Number(rows[0].max)

  const updated = await prisma.$executeRawUnsafe(`
    WITH numbered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, id ASC) AS rn
      FROM "Listing"
      WHERE "itemCode" IS NULL
    )
    UPDATE "Listing" l
    SET "itemCode" = 'GGMP' || (${start} + n.rn)::text
    FROM numbered n
    WHERE l.id = n.id
  `)

  if (updated === 0) {
    console.log('✓ All listings already have an item code. Nothing to do.')
  } else {
    console.log(`✓ Assigned item codes to ${updated} listing(s), starting at GGMP${start + 1}`)
  }
}

main()
  .catch((e) => { console.error('Backfill failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
