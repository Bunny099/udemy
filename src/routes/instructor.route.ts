
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { deleteCourse, draftCourse, getCourse ,patchCourse,publishCourse} from "../controllers/instructor.controller.js";
const router = Router();

router.get("/course",authMiddleware,getCourse)
router.post("/course/draft",authMiddleware,draftCourse)
router.post("/course/publish",authMiddleware,publishCourse)
router.patch("/course",authMiddleware,patchCourse)
router.delete("/course",authMiddleware,deleteCourse)
export default router;