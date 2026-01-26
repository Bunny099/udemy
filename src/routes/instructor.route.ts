
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { draftCourse, getCourse ,publishCourse} from "../controllers/instructor.controller.js";
const router = Router();

router.get("/course",authMiddleware,getCourse)
router.post("/course/draft",authMiddleware,draftCourse)
router.post("/course/publish",authMiddleware,publishCourse)

export default router;