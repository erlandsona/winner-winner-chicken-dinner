import { prisma } from './prisma/client'

export async function hello(id: string) {
  const maybeData = prisma.pollQuestion.findFirst({ where: { id: id } })
  console.log(maybeData)
  return JSON.stringify(maybeData)
}
