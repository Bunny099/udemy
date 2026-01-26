import { prismaDb } from "../lib/db.js"

interface User {
        id: string,
        role: string
}
interface CourseData{
    user:{
        id:string,
    role:string,
    }  
    name:string,
    status:string,
}

interface PublishCourseData{
    user:{
    id:string,
    role:string,
    },  
    courseId:string
}

export const fetchCourse = async (user: User) => {
    const id = user.id;

    const courses = await prismaDb.course.findMany({ where: { instructorId: id, course_status: "Publish" } });
    if (!courses) {
        throw new Error("No course found!")
    }
    return courses;
}

export const createDraftCourse = async(data:CourseData)=>{
    const {name,status,user} = data;
    let course;
    if(status === "Draft"){
        course=await prismaDb.course.create({data:{name,course_status:"Draft",instructorId:user.id}})
    }
    if(!course){
        throw new Error("Failed to create course!")
    }
    return course;
}

export const createPublishCourse = async(data:PublishCourseData)=>{
    const {courseId,user} = data;
    let message ;
    let response;
    let course = await prismaDb.course.findFirst({where:{id:courseId,instructorId:user.id,course_status:"Draft"},include:{lesson:true}});
    if(!course){
        throw new Error("Can't find course")
    }
    const count = course.lesson.length;
    if(course.course_status ==="Publish"){
        message= {sucess:true}
    }
    if(count >=1 && course.course_status ==="Draft"){
        response =await prismaDb.course.update({where:{instructorId:user.id,id:courseId},data:{course_status:"Publish"}})
    }
    return {message,response}
}