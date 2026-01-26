import type { Request, Response } from "express"
import { fetchCourse, createDraftCourse ,createPublishCourse} from "../services/instructor.service.js";

export const getCourse = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized!" })
        }
        if (user.role !== "Instructor") {
            return res.status(401).json({ message: "Not authorized!" })
        }
        const courses = await fetchCourse(user);
        return res.status(200).json({ data: courses, message: "Course found!" })
    } catch (e: any) {
        return res.status(500).json({ message: e.message || "Server error!" })
    }
}
export const draftCourse = async (req: Request, res: Response) => {
    try {
        const user = req.body;
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

export const publishCourse = async(req:Request,res:Response)=>{
    try{
        const {courseId} = req.body;
        const user = req.body;
        if(!user){
            return res.status(401).json({message:"Unauthorized!"})
        }
        if(!courseId){
            return res.status(400).json({message:"Field missing!"})
        }
        const course = await createPublishCourse({courseId,user})
        if(course.message?.sucess===true){
            return res.status(200).json({message:"Already publish"})
        }
        if(!course.response){
            return res.status(400).json({message:"Failed to publish!"})
        }
        return res.status(200).json({message:"Course publish!"})
    }catch(e:any){
        return res.status(500).json({message:e.message || "Server error!"})
    }
}

