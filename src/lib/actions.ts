'use server';

import {
  AssignmentSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  parentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from './formValidationSchema';
import prisma from './prisma';
import { clerkClient } from '@clerk/nextjs/server';

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  try {
    const user = await (
      await clerkClient()
    ).users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'teacher' },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await (
      await clerkClient()
    ).users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== '' && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== '' && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;

  try {
    await prisma.teacher.delete({
      where: {
        id: id.toString(),
      },
    });

    // revalidatePath("/list/result");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting result:', err);
    return { success: false, error: true };
  }
};

export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await (
      await clerkClient()
    ).users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'student' },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await (
      await clerkClient()
    ).users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== '' && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== '' && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;
  try {
    await (await clerkClient()).users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (currentState: CurrentState, data: ExamSchema) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (currentState: CurrentState, data: ExamSchema) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createParent = async (currentState: CurrentState, data: ParentSchema) => {
  try {
    // Step 1: Create Clerk User
    const clerk = await clerkClient(); // Ensure the Clerk client is available

    const user = await (
      await clerkClient()
    ).users.createUser({
      username: data.username ?? '',
      firstName: data.name ?? '',
      lastName: data.surname ?? '',
      emailAddress: data.email ? [data.email] : [],
      password: data.password ?? '',
      publicMetadata: { role: 'parent' },
    });

    const newParent = await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email ?? null,
        phone: data.phone ?? '',
        address: data.address,
        students: {
          connect: data.studentId?.map((id) => ({ id })),
        },
      },
    });

    return { success: true, parent: newParent };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error creating parent:', error);
      return { success: false, error: error.message || 'Failed to create parent.' };
    } else {
      console.error('❌ Unknown error:', error);
      return { success: false, error: 'An unknown error occurred.' };
    }
  }
};

export const updateParent = async (parentId: string, data: Partial<ParentSchema>) => {
  try {
    // Validate data using Zod
    const validatedData = parentSchema.partial().safeParse(data);
    if (!validatedData.success) {
      console.error('Validation failed:', validatedData.error.format());
      return { error: 'Invalid input data' };
    }

    const { username, name, surname, email, phone, address } = validatedData.data;

    // Update parent details
    const updatedParent = await prisma.parent.update({
      where: { id: parentId },
      data: {
        username,
        name,
        surname,
        email: email || null,
        phone: phone ?? '',
        address,
      },
    });

    return { success: true, parent: updatedParent };
  } catch (error) {
    console.error('Error updating parent:', error);
    return { error: 'Failed to update parent' };
  }
};

export const deleteParent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;

  try {
    await prisma.parent.delete({
      where: {
        id: id.toString(),
      },
    });

    // revalidatePath("/list/result");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting result:', err);
    return { success: false, error: true };
  }
};

export const createLesson = async (currentState: CurrentState, data: LessonSchema) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (currentState: CurrentState, data: LessonSchema) => {
  try {
    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        subjectId: data.subjectId, // ✅ Fixed: Replaced gradeId with subjectId
        classId: data.classId,
        teacherId: data.teacherId, // ✅ Fixed: Using a single teacherId
        day: data.day, // ✅ Added: Day selection
        startTime: new Date(`1970-01-01T${data.startTime}:00Z`), // ✅ Converts time to DateTime
        endTime: new Date(`1970-01-01T${data.endTime}:00Z`), // ✅ Converts time to DateTime
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;

  try {
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/result");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting result:', err);
    return { success: false, error: true };
  }
};

export const createResult = async (currentState: CurrentState, data: ResultSchema) => {
  try {
    // Create the new result in the database
    const newResult = await prisma.result.create({
      data: {
        score: data.score,
        date: data.date || new Date(), // Default to current date if not provided

        // Optional relations
        examId: data.examId,
        assignmentId: data.assignmentId,

        studentId: data.studentId,
        teacherId: data.teacherId,

        classId: data.classId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (currentState: CurrentState, data: ResultSchema) => {
  try {
    // Update the existing result in the database
    const updatedResult = await prisma.result.update({
      where: {
        id: Number(data.id), // Convert the id to a number
      },
      data: {
        score: data.score,
        date: data.date || new Date(), // Default to current date if not provided

        // Optional relations
        examId: data.examId,
        assignmentId: data.assignmentId,

        studentId: data.studentId,
        teacherId: data.teacherId,

        classId: data.classId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;

  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/result");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting result:', err);
    return { success: false, error: true };
  }
};

export const createAssignment = async (data: AssignmentSchema) => {
  try {
    const newAssignment = await prisma.assignment.create({
      data: {
        title: data?.title ?? '',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        subjectId: data.subjectId ?? null,
        lessonId: data.lessonId ?? null,
        classId: data.classId ?? null,
        teacherId: data.teacherId ?? null,
      },
    });

    return { success: true, error: false, assignment: newAssignment };
  } catch (err) {
    console.log('Error creating assignment:', err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (id: number, data: AssignmentSchema) => {
  try {
    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({ where: { id } });
    if (!existingAssignment) {
      console.log(`Assignment with id ${id} not found`);
      return { success: false, error: 'Assignment not found' };
    }

    console.log('Updating assignment with data:', data);

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        title: data.title,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        lessonId: data.lessonId ?? null,
        classId: data.classId ?? null,
        teacherId: data.teacherId ?? null,
      },
    });

    return { success: true, error: false, assignment: updatedAssignment };
  } catch (err) {
    console.error('Error updating assignment:', err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (currentState: CurrentState, data: FormData) => {
  const id = data.get('id') as string;

  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/result");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting result:', err);
    return { success: false, error: true };
  }
};

export const createEvent = async (data: EventSchema) => {
  try {
    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        date: data.date ? new Date(data.date).toISOString() : null, // Ensure valid ISO date
        description: data.description.trim(), // Ensure no empty spaces
        startTime: data.startTime ? data.startTime.toString() : new Date().toISOString(), // Ensure valid value
        endTime: data.endTime ? data.endTime.toString() : new Date().toISOString(), // Ensure valid value
        classId: data.classId ?? null,
      },
    });

    return { success: true, error: false, event: newEvent };
  } catch (err) {
    console.log('Error creating event:', err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (id: number, data: EventSchema) => {
  try {
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        date: data.date ? new Date(data.date).toISOString() : null, // Ensure valid ISO date
        description: data.description.trim(), // Ensure no empty spaces
        startTime: data.startTime ? data.startTime.toString() : new Date().toISOString(), // Ensure valid value
        endTime: data.endTime ? data.endTime.toString() : new Date().toISOString(), // Ensure valid value
        classId: data.classId ?? null,
      },
    });

    return { success: true, error: false, event: updatedEvent };
  } catch (err) {
    console.log('Error updating event:', err);
    return { success: false, error: true };
  }
};
