
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { deleteCourse, deleteLesson, draftCourse, getCourse ,getLesson,patchCourse,patchLesson,postLesson,publishCourse} from "../controllers/instructor.controller.js";
const router = Router();

//course routes
router.get("/course",authMiddleware,getCourse)
router.post("/course/draft",authMiddleware,draftCourse)
router.post("/course/publish",authMiddleware,publishCourse)
router.patch("/course",authMiddleware,patchCourse)
router.delete("/course",authMiddleware,deleteCourse)

//lessons

router.get("/:courseId/lesson",authMiddleware,getLesson)
router.post("/course/lesson",authMiddleware,postLesson);
router.patch("/lesson",authMiddleware,patchLesson);
router.delete("/lesson",authMiddleware,deleteLesson)

export default router;