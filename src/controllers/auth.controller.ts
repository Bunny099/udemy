import type { Request, Response } from "express";
import { loginCheck, registerUser } from "../services/auth.service.js";
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const user = await registerUser({ name, email, password, role });
        return res.status(201).json({ data: user, message: "Register Success!" })

    } catch (e:any) {
        return res.status(500).json({ message: e.message || "Server error" })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const token = await loginCheck({ email, password, role });
        return res.status(200).json({token,message:"Login success!"})
    } catch (e:any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}