const { prisma: db } = require('./port-data.js')

exports.handler = async function handler() {
  try {
    const results = await db.pollQuestion.findMany()

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
