import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(req) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) return apiError('Invalid email or password', 422)

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return apiError('Invalid email or password', 401)

    const match = await bcrypt.compare(password, user.password)
    if (!match) return apiError('Invalid email or password', 401)

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    return apiSuccess({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
      token,
    })
  } catch (err) {
    console.error('Login error:', err)
    return apiError('Internal server error', 500)
  }
}
