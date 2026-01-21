import express from "express";

const app = express();
app.get("/hello",(req,res)=>{
    res.send("hello")
})
app.listen(3000)