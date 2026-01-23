import express, { json } from "express";
import cors from "cors"
const app = express();
app.use(cors());
app.use(json())
app.get("/hello",(req,res)=>{
    res.send("hello")
})
app.listen(3000)