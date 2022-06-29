import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export async function questions_index() {
  return await prisma.pollQuestion.findMany()
}

export async function questions_show(id: string) {
  const maybeData = await prisma.pollQuestion.findFirst({ where: { id: id } })
  return (maybeData || null)
}
