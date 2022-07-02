import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query"] })

export async function handler() {
  try {
    const questions = await prisma.pollQuestion.findMany()
    return {
      body: JSON.stringify(questions),
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  } catch (e) {
    return {
      status: 500,
      body: JSON.stringify(e)
    }
  }
}

