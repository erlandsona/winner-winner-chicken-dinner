import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query"] })

export default async function handler() {
  try {
    return {
      body: await prisma.pollQuestion.findMany(),
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

