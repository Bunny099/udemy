import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js"
import "dotenv/config";

let adapter = new PrismaPg({
    connectionString:process.env.DATABASE_URL!
})
export const prismaDb = new PrismaClient({adapter});