import express, { json } from "express";
import cors from "cors"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { prismaDb } from "./lib/db.js";
import { authMiddleware } from "./middleware/auth.middleware.js";



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
        if (role === "Instructor" || role === "Student") {
            let existingMail = await prismaDb.user.findFirst({ where: { email } });
            if (existingMail) {
                return res.status(409).json({ message: "User exist!" })
            }
            const hassPass = await bcrypt.hash(password, 3);
            if (!hassPass) {
                return res.status(500).json({ message: "Service error!" })
            }

            let response = await prismaDb.user.create({
                data: {
                    name: name, email: email, role: role, password: hassPass
                }
            })

            if (!response) {
                return res.status(400).json({ message: "Db failed!" })
            }
            return res.status(201).json({ data: response, message: "Register success!" })
        }
        return res.status(400).json({ message: "Invalid role" })

    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }

})
app.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Field missing!" })
        }
        if (role === "Instructor" || role === "Student") {
            let existingUser = await prismaDb.user.findFirst({ where: { email, role } });
            if (!existingUser) {
                return res.status(40).json({ message: "Not found!" })
            }
            let isPassValid = await bcrypt.compare(password, existingUser?.password as string);
            if (!isPassValid) {
                return res.status(400).json({ message: "Password invalid!" })
            }
            let token = jwt.sign({ id: existingUser?.id, role: existingUser?.role }, AUTH_SECRET);
            return res.status(200).json({ data: token, message: "Login success!" })
        }
        return res.status(400).json({ message: "Invalid role!" })

    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }
})

app.get("/auth/me", authMiddleware, (req, res) => {
    const user = (req as any).user
    return res.status(200).json({ user, message: "Verified user okay!" })
})

//instrcutor course end-points
app.get("/instructor/course", authMiddleware, async (req, res) => {
    try {
        const user = (req as any).user;
        if (user.role !== "Instructor") {
            return res.status(401).json({ message: "Not authorize!" })
        }
        let response = await prismaDb.course.findMany({ where: { instructorId: user.id, course_status: "Publish" } });
        if (!response) {
            return res.status(400).json({ message: "No course found!" })
        }
        return res.status(200).json({ response, message: "course found!" })
    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }

})
app.post("/instructor/course/draft", authMiddleware, async (req, res) => {
    try {
        const { name, status } = req.body;
        const user = (req as any).user;
        let course;

        if (!name || !status) {
            return res.status(400).json({ message: "Can't create course!" })
        }
        if (status === "Draft") {
            course = await prismaDb.course.create({ data: { name, course_status: "Draft", instructorId: user.id } });
        }

        if (!course) {
            return res.status(404).json({ message: "course failed!" })
        }
        return res.status(200).json({ course, message: "course draft!" })
    } catch (e) {
        return res.status(500).json({ message: "Serror error!" })
    }

})
app.post("/instructor/course/publish", authMiddleware, async (req, res) => {
    try {
        let user = (req as any).user;
        let courseId = req.body;
        let response;

        if (!courseId ) {
            return res.status(400).json({ message: "Field missing!" })
        }

        let course = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id, course_status: "Draft" }, include: { lesson: true } });
        if (!course) {
            return res.status(401).json({ message: "Can't find course" })
        }
        let count = course.lesson.length;

        if (course.course_status === "Publish") {
            return res.status(200).json({ message: "success" })
        }
        if (count >= 1 && course.course_status === "Draft") {
            response = await prismaDb.course.update({ where: { id: courseId, instructorId: user.id }, data: { course_status: "Publish" } })
        }
        if (!response) {
            return res.status(403).json({ message: "update failed!" })
        }
        return res.status(200).json({ response, message: "course publish!" })
    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }

})
app.patch("/instructor/course/", authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.body;
        const { name } = req.body;
        const user = (req as any).user;

        if (!courseId || !name) {
            return res.status(400).json({ message: "Field is missing!" })
        }
        let iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id } });
        if (!iscourseExist) {
            return res.status(404).json({ message: "No course found!" })
        }
        let response = await prismaDb.course.update({ where: { id: courseId }, data: { name } });
        if (!response) {
            return res.status(400).json({ message: "updated failed!" })
        }
        return res.status(200).json({ message: "course updated!" })
    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }
})
app.delete("/instructor/course/", authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = (req as any).user;

        if (!courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        let iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id, course_status: "Draft" } });
        if (!iscourseExist) {
            return res.status(404).json({ message: "Course not found!" })
        }
        if (iscourseExist.course_status === "Publish") {
            return res.status(409).json({ message: "Can't delete publish course!" })
        }
        let response = await prismaDb.course.delete({ where: { id: courseId, instructorId: user.id, course_status: "Draft" } })
        if (!response) {
            return res.status(400).json({ message: "Course delete failed!" })
        }
        return res.status(200).json({ message: "Course deleted!" })
    } catch (e) {
        return res.status(500).json({ messeg: "Server error!" })
    }

})

//lessons
app.get("/instructor/:courseId/lesson", authMiddleware, async (req, res) => {
    try {
        let { courseId } = req.params;
        const user = (req as any).user;
        if(user.role !== "Instructor"){
            return res.status(401).json({message:"Not authorised!"})
        }
        if (!courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }

        let response = await prismaDb.course.findMany({ where: { id: courseId as string, instructorId: user.id }, include: { lesson: true } });
        if (!response) {
            return res.status(404).json({ message: "not found!" })
        }
        return res.status(200).json({ response, message: "lesson success!" })
    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }


})
app.post("/instructor/course/lesson", authMiddleware, async (req, res) => {
    try {
        const { courseId, content } = req.body;
        const user = (req as any).user;
        let response;

        if (!courseId || !content) {
            return res.status(400).json({ message: "Field missing!" })
        }
        let iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id, course_status: "Draft" } });
        if (!iscourseExist) {
            return res.status(404).json({ message: "Course not found!" })
        }
        if (iscourseExist && iscourseExist.course_status === "Draft") {
            response = await prismaDb.lesson.create({
                data: {
                    content, courseId
                }
            })
        }

        if (!response) {
            return res.status(400).json({ message: "Failed to add lessons!" })
        }
        return res.status(200).json({ response, message: "lessons added!" })
    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }

})

app.patch("/instructor/course/lesson/", authMiddleware, async (req, res) => {
    try {
        const { courseId, content, lessonId } = req.body;
        const user = (req as any).user;
        let response;

        if (!courseId || !content || !lessonId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        let iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id, course_status: "Draft" } });
        if (!iscourseExist) {
            return res.status(404).json({ message: "No course found!" })
        }
        let islessonExist = await prismaDb.lesson.findFirst({ where: { id: lessonId, courseId } });
        if (!islessonExist) {
            return res.status(400).json({ message: "Not found!" })
        }
        if (iscourseExist && iscourseExist && iscourseExist.course_status === "Draft") {
            response = await prismaDb.lesson.update({ where: { id: lessonId, courseId }, data: { content } });
        }

        if (!response) {
            return res.status(400).json({ message: "Failed to update!" })
        }
        return res.status(200).json({ message: "Lesson updated!" })
    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }

})
app.delete("/instructor/lesson", authMiddleware, async (req, res) => {
    try {

        const { courseId, lessonId } = req.body;
        const user = (req as any).user;
        let response;

        if (!lessonId || !courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        let iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id, course_status: "Draft" } });
        if (iscourseExist?.course_status === "Publish") {
            return res.status(409).json({ message: "Can't delete publish course lesson!" })
        }
        if (!iscourseExist) {
            return res.status(404).json({ message: "No course found!" })
        }
        let islessonExist = await prismaDb.lesson.findFirst({ where: { id: lessonId as string, courseId } });
        if (!islessonExist) {
            return res.status(400).json({ message: "not found!" })
        }
        if (iscourseExist && iscourseExist.course_status === "Draft" && islessonExist) {
            response = await prismaDb.lesson.delete({ where: { id: lessonId, courseId } });
        }

        if (!response) {
            return res.status(400).json({ message: "failed to delete!" })
        }
        return res.status(200).json({ message: "lesson deleted!" })
    } catch (e) {
        return res.status(500).json({ message: "Server error!" })
    }
})


app.listen(3000)