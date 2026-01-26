import { prismaDb } from "../lib/db.js";

type role = "Instructor" | "Student";
interface EnrollmentData {
    user: {
        id: string,
        role: role
    },
    courseId: string
}
interface StudentLessonData {
    user: {
        id: string,
        role: role
    },
    courseId: string | string[]
}
interface ProgressData {
    user: {
        id: string,
        role: role
    },
    courseId: string,
    lessonId: string
}
export const createEnrollment = async (data: EnrollmentData) => {
    const { user, courseId } = data;
    let response;
    if (user.role !== "Student") {
        throw new Error("Not authorized!")
    }
    const iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, course_status: "Publish" } });
    if (!iscourseExist) {
        throw new Error("Course not exist!")
    }
    const isenrolmentExist = await prismaDb.enrollment.findFirst({ where: { studentId: user.id, courseId } });
    if (isenrolmentExist) {
        throw new Error("Enrollment already exist!")
    }
    if (iscourseExist.course_status === "Publish" && iscourseExist) {
        response = await prismaDb.enrollment.create({ data: { studentId: user.id, courseId } })
    }
    if (!response) {
        throw new Error("Failed to enroll course!")
    }
    return response
}

export const fetchStudentLessons = async (data: StudentLessonData) => {
    const { courseId, user } = data;
    const studentId = user.id;
    let response;
    if (user.role !== "Student") {
        throw new Error("Not authorized!")
    }
    const iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId as string, course_status: "Publish" } });
    if (!iscourseExist) {
        throw new Error("Course not found!")
    }
    const isenrolmentExist = await prismaDb.enrollment.findFirst({ where: { studentId, courseId: courseId as string } });
    if (!isenrolmentExist) {
        throw new Error("No enrollment found!")
    }
    if (isenrolmentExist && iscourseExist.course_status === "Publish") {
        response = await prismaDb.lesson.findMany({ where: { courseId: courseId as string } })
    }
    if (!response) {
        throw new Error("No lessons found!")
    }
    return response;
}

export const createStudentProgress = async (data: ProgressData) => {
    const { courseId, lessonId, user } = data;
    const studentId = user.id;
    let response;
    if (user.role !== "Student") {
        throw new Error("Not authorized!")
    }
    const iscourseExist = await prismaDb.course.findFirst({ where: { id: courseId, course_status: "Publish" } });
    if (!iscourseExist) {
        throw new Error("Course not found!")
    }
    const isenrolmentExist = await prismaDb.enrollment.findFirst({ where: { courseId, studentId } });
    if (!isenrolmentExist) {
        throw new Error("Enrollement not found!")
    }
    const islessonExist = await prismaDb.lesson.findFirst({ where: { id: lessonId, courseId } });
    if (!islessonExist) {
        throw new Error("Lesson not found!")
    }
    const isprogressExist = await prismaDb.progress.findUnique({ where: { ProgressId: { studentId, lessonId } } });

    if (isprogressExist?.status ==="COMPLETED") {
        throw new Error("Lesson already complete")
    }
    if (iscourseExist?.course_status === "Publish" && isenrolmentExist) {
        response = await prismaDb.progress.create({ data: { status: "COMPLETED", student: { connect: { id: studentId } }, lesson: { connect: { id: lessonId } } } })
    }
    if (!response) {
        throw new Error("Progress Failed!")
    }
    return response;
}