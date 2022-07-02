import { prisma as db } from './prisma/client'

export async function questions_index() {
  return await db.pollQuestion.findMany()
}

export async function questions_show(id: string) {
  const maybeData = await db.pollQuestion.findFirst({ where: { id: id } })
  return (maybeData || null)
}
