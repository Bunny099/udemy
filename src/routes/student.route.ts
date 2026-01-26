import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getStudentLessons, studentEnroll, studentProgress } from "../controllers/student.controller.js";

const router = Router();

router.post("/course/enroll", authMiddleware, studentEnroll)
router.get("/course/:courseId/lesson", authMiddleware, getStudentLessons)
router.post("/course/lesson/progress", authMiddleware, studentProgress)

export default router;