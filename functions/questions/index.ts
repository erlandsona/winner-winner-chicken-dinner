import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query"] })

export async function handler() {
  try {
    const results = await prisma.pollQuestion.findMany()

    return {
      statusCode: 200,
      body: JSON.stringify(results)
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e)
    }
  }
}

// export async function questions_show(id: string) {
//   const maybeData = await prisma.pollQuestion.findFirst({ where: { id: id } })
//   return (maybeData || null)
// }
