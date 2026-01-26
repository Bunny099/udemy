import { prismaDb } from "../lib/db.js"

type role = "Instructor" | "Student"
type courseStatus = "Draft" | "Publish"
interface User {
    id: string,
    role: role
}
interface CourseData {
    user: {
        id: string,
        role: role,
    }
    name: string,
    status: courseStatus
}

interface PublishCourseData {
    user: {
        id: string,
        role: role,
    },
    courseId: string
}
interface UpdateCourseData {
    user: { id: string, role: role }, name: string, courseId: string
}
interface DeleteCourseData {
    user: {
        id: string,
        role: role,
    },
    courseId: string
}
interface LessonData{
    user:{
        id:string,
        role:role
    },
    courseId: string | string[],
    
}

interface CreateLessonData{
    user:{
        id:string,
        role:role
    },
   courseId:string
    content:string
}

interface UpdateLessonData{
    user:{
        id:string,
        role:role
    },
    courseId:string,
    lessonId:string,
    content:string
}
interface DeleteLessonData{
    user:{
        id:string,
        role:role
    },
    courseId:string,
    lessonId:string
}
export const fetchCourse = async (user: User) => {
    const id = user.id;
    if (user.role !== "Instructor") {
        throw new Error("Not authorized!")
    }
    const courses = await prismaDb.course.findMany({ where: { instructorId: id, course_status: "Publish" } });
    if (courses.length === 0) {
        return [];
    }
    return courses;
}

export const createDraftCourse = async (data: CourseData) => {
    const { name, status, user } = data;
    let course;
    if (status === "Draft") {
        course = await prismaDb.course.create({ data: { name, course_status: "Draft", instructorId: user.id } })
    }
    if (!course) {
        throw new Error("Failed to create course!")
    }
    return course;
}

export const createPublishCourse = async (data: PublishCourseData) => {
    const { courseId, user } = data;
    let response;

    let course = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id, course_status: "Draft" }, include: { lesson: true } });
    if (!course) {
        throw new Error("Can't find course")
    }
    const count = course.lesson.length;

    if (count >= 1 && course.course_status === "Draft") {
        response = await prismaDb.course.update({ where: { instructorId: user.id, id: courseId }, data: { course_status: "Publish" } })
    }
    if (!response) {
        throw new Error("Failed to publish course!")
    }
    return response;
}

export const updateCourse = async (data: UpdateCourseData) => {
    const { name, courseId, user } = data;
    let iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id } });
    if (!iscourseExist) {
        throw new Error("Course not found!")
    }
    let response = await prismaDb.course.update({ where: { id: courseId, instructorId: user.id }, data: { name } });
    if (!response) {
        throw new Error("Failed to update course!")
    }
    return response
}

export const deleteCourseService = async (data: DeleteCourseData) => {
    const { user, courseId } = data;
    let iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, instructorId: user.id } });
    if (!iscourseExist) {
        throw new Error("Course not found!")
    }
    let response = await prismaDb.course.delete({ where: { id: courseId, instructorId: user.id } });
    if (!response) {
        throw new Error("Failed to delete course")
    }
    return response;
}

export const fetchLesson = async(data:LessonData)=>{
    const {courseId,user} = data;
    if(user.role !== "Instructor"){
        throw new Error("Not authorized")
    }
    let response = await prismaDb.course.findFirst({where:{id:courseId as string,instructorId:user.id},include:{lesson:true}});
    if(!response){
        throw new Error("No lesson found!")
    }
    return response;
}

export const createLesson = async(data:CreateLessonData)=>{
    const {user,content,courseId} = data;
    let response;
    const iscourseExist = await prismaDb.course.findFirst({where:{id:courseId as string,instructorId:user.id,course_status:"Draft"}});
    if(!iscourseExist){
        throw new Error("Course not found!")
    }
    if(iscourseExist && iscourseExist.course_status ==="Draft"){
        response  = await prismaDb.lesson.create({data:{courseId,content}})
    }
    if(!response){
        throw new Error("Failed to add lesson!")
    }
    return response;
}

export const updateLesson = async(data:UpdateLessonData)=>{
    const {courseId,lessonId,content,user} = data;
    let response;
    const iscourseExist = await prismaDb.course.findFirst({where:{id:courseId,instructorId:user.id,course_status:"Draft"}});
    if(!iscourseExist){
        throw new Error("Course not found!")
    }
    const islessonExist = await prismaDb.lesson.findFirst({where:{courseId,id:lessonId}});
    if(!islessonExist){
        throw new Error("Lesson not found!")
    }
    if(iscourseExist && islessonExist && iscourseExist.course_status ==="Draft"){
        response = await prismaDb.lesson.update({where:{id:lessonId,courseId},data:{content}})
    }
    if(!response){
        throw new Error("Failed to update lesson!")
    }
    return response;
}

export const funDeleteLesson = async(data:DeleteLessonData)=>{
    const {courseId,lessonId,user} = data;
    let response;
    if(user.role !== "Instructor"){
        throw new Error("Unauthorized!")
    } 
    const iscourseExist = await prismaDb.course.findFirst({where:{id:courseId,instructorId:user.id}});
    if(!iscourseExist){
        throw new Error("Course not found!")
    }
    if(iscourseExist.course_status ==="Publish"){
        throw new Error("Can't delete publish course lesson!")
    }
    const islessonExist = await prismaDb.lesson.findFirst({where:{id:lessonId,courseId}});
    if(!islessonExist){
        throw new Error("Lesson not found!")
    }
    if(iscourseExist && iscourseExist.course_status==="Draft" && islessonExist){
        response = await prismaDb.lesson.delete({where:{id:lessonId,courseId}})
    }
    if(!response){
        throw new Error("Failed to delete lesson!")
    }
    return response;
}