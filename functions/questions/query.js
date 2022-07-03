const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ["query"] })

exports.renderer = async function () {
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

