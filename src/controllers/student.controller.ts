import type { Request, Response } from "express";
import { createEnrollment, fetchStudentLessons, createStudentProgress } from "../services/student.service.js";

export const studentEnroll = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const response = await createEnrollment({ user, courseId });
        return res.status(201).json({ response, message: "Enrolled successfully!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error" })
    }
}

export const getStudentLessons = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (!courseId) {
            return res.status(400).json({ message: "Field missing!" })
        }
        const response = await fetchStudentLessons({ user, courseId });
        return res.status(200).json({ response, message: "Lessons found success!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}

export const studentProgress = async (req: Request, res: Response) => {
    try {
        const { courseId, lessonId } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({message:"Unauthorized!"})
        }
        if (!courseId || !lessonId) {
            return res.status(400).json({ message: "Field in missing!" })
        }
        const response = await createStudentProgress({ user, courseId, lessonId });
        return res.status(200).json({ response, message: "Lesson complete!" })

    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}