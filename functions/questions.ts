import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query"] })

export async function handler() {
  try {
    const questions = await prisma.pollQuestion.findMany()
    return {
      body: JSON.stringify(questions),
      statusCode: 200,
      header: {
        'Content-Type': 'application/json'
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e)
    }
  }
}

