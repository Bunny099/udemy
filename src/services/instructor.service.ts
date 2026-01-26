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