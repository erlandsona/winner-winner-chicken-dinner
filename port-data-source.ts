import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query"] })

export async function questions_index() {
  return await prisma.pollQuestion.findMany()
}

export async function questions_show(id: string) {
  const maybeData = await prisma.pollQuestion.findFirst({ where: { id: id } })
  return (maybeData || null)
}
