import express, { json } from "express";
import cors from "cors"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { prismaDb } from "./lib/db.js";


const app = express();

app.use(cors());
app.use(json())
let AUTH_SECRET = process.env.AUTH_SECRET!;

app.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Field missing!" })
        }
        let existingMail = await prismaDb.user.findFirst({where:{email}});
        if(existingMail){
            return res.status(400).json({message:"User exist!"})
        }
        const hassPass = await bcrypt.hash(password, 3);
        if (!hassPass) {
            return res.status(500).json({message: "Service error!" })
        }
        
        let response = await prismaDb.user.create({
            data: {
                name: name, email: email, role: role, password: hassPass
            }
        })
        console.log(response)
        if (!response) {
            return res.status(400).json({message: "Db failed!" })
        }
        return res.status(201).json({ data:response ,message: "Register success!"})
    } catch (e) {
        return res.status(500).json({ success: false, message: "Server error!" })
    }

})

app.listen(3000)