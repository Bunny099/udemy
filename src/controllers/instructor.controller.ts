import type { Request, Response } from "express"
import { fetchCourse, createDraftCourse, createPublishCourse, updateCourse, deleteCourseService, fetchLesson, createLesson, updateLesson, funDeleteLesson } from "../services/instructor.service.js";

export const getCourse = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        const courses = await fetchCourse(user);
        return res.status(200).json({ data: courses, message: "Course found!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}
export const draftCourse = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { name, status } = req.body;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!name || !status) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const course = await createDraftCourse({ user, name, status })
        return res.status(201).json({ course, message: "Course created!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}

export const publishCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const course = await createPublishCourse({ courseId, user })

        return res.status(200).json({ response: course, message: "Course publish!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}

export const patchCourse = async (req: Request, res: Response) => {
    try {
        const { courseId, name } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId || !name) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const response = await updateCourse({ user, courseId, name })
        return res.status(200).json({ response, message: "Course updated!" })

    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }

}
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const respone = await deleteCourseService({ user, courseId });
        if (!respone) {
            return res.status(400).json({ message: "Failed to delete course!" })
        }
        return res.status(200).json({ message: "Course deleted!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }

}

export const getLesson = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        if (!courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const response = await fetchLesson({ user, courseId })
        return res.status(200).json({ response, message: "Course lessons!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}

export const postLesson = async (req: Request, res: Response) => {
    try {
        const { courseId, content } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId || !content) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const response = await createLesson({ courseId, user, content });
        return res.status(201).json({ response, message: "Lesson added!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Sever error!" })
    }
}

export const patchLesson = async (req: Request, res: Response) => {
    try {
        const { courseId, lessonId, content } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId || !lessonId || !content) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const response = await updateLesson({ user, courseId, lessonId, content });
        return res.status(200).json({ response, message: "Lesson updated!" })
    } catch (e: any) {
        return res.status(500).json({ message: "Server error!" })
    }
}

export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const { courseId, lessonId } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId || !lessonId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const response = await funDeleteLesson({ user, courseId, lessonId });
        return res.status(200).json({ response, message: "Lesson deleted!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}