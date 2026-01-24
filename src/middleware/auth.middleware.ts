import { type Request, type Response, type NextFunction } from "express"
import jwt from "jsonwebtoken";
import "dotenv/config";
const AUTH_SECRET = process.env.AUTH_SECRET!;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(400).json({ message: "Auth header missing!" })
        }
        let token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(400).json({ message: "token is missing!" })
        }
        let decoded = jwt.verify(token, AUTH_SECRET);
        if (!decoded) {
            return res.status(400).json({ message: "Token verifaction failed" })
        }
        (req as any).user = decoded;
        next()
    } catch (e) {
        return res.status(500).json({ message: "server error in auth!" })
    }


}