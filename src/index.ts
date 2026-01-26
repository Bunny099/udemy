import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import instructorRoute from "./routes/instructor.route.js"
import studentRoute from "./routes/student.route.js"
const app = express();

app.use(cors())
app.use(express.json())
app.use("/auth", authRoutes)
app.use("/instructor",instructorRoute)
app.use("/student",studentRoute)

export default app;