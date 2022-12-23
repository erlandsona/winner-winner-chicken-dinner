import { connect } from '@planetscale/database'


export async function query(sql: string, args: any[]) {
  // create the connection to database
  const conn = connect({ url: process.env.DATABASE_URL })
  const { rows } = await conn.execute(sql, args)
  return rows
}
