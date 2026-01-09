import { PrismaClient } from '@prisma/client'

// Instância global do Prisma para evitar múltiplas conexões em desenvolvimento
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
