
import { prismaDb } from "../lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
interface UserData {
    name: string,
    email: string,
    password: string,
    role: "Instructor" | "Student"
}
interface LoginData {
    email: string,
    password: string,
    role: "Instructor" | "Student"
}

if(!process.env.AUTH_SECRET){
    throw new Error("Auth Secret is not define!")
}
const AUTH_SECRET = process.env.AUTH_SECRET
export const registerUser = async (data: UserData) => {
    const { name, email, password, role } = data;
    if (role !== "Instructor" && role !== "Student") {
        throw new Error("Invalid field!")
    }
    const existingMail = await prismaDb.user.findFirst({ where: { email } });
    if (existingMail) {
        throw new Error("User exist!")
    }
    const hassPassword = await bcrypt.hash(password, 5);
    const user = await prismaDb.user.create({
        data: {
            name, email, password: hassPassword, role
        }
    })
    if(!user){
        throw new Error("Registration failed!")
    }
    return user;
}

export const loginCheck = async (data: LoginData) => {
    const { email, password, role } = data;
    if (role !== "Instructor" && role !== "Student") {
        throw new Error("Invalid filed")
    }
    const existingUser = await prismaDb.user.findFirst({ where: { email, role } });
    if (!existingUser) {
        throw new Error("User not found!")
    }
    const isPassvalid = await bcrypt.compare(password, existingUser.password);
    if (!isPassvalid) {
        throw new Error("Invalid password!")
    }
    const token = await jwt.sign({ id: existingUser.id, role: existingUser.role }, AUTH_SECRET)
    return token;
}