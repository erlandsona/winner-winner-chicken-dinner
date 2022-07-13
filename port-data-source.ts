import mysql from "mysql2/promise";
import dotenv from "dotenv";


export async function query(sql: string) {
  // create the connection to database
  dotenv.config()
  const conn = await mysql.createConnection(process.env.DATABASE_URL!)
  const [rows, _fields] = await conn.execute(sql)
  return rows
}

// export async function questions_show(id: string) {
//   const maybeData = await prisma.pollQuestion.findFirst({ where: { id: id } })
//   return (maybeData || null)
// }
