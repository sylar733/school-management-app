import { z } from 'zod';

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: 'Subject name is required!' }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: 'Subject name is required!' }),
  capacity: z.coerce.number().min(1, { message: 'Capacity name is required!' }),
  gradeId: z.coerce.number().min(1, { message: 'Grade name is required!' }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long!' })
    .max(20, { message: 'Username must be at most 20 characters long!' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long!' })
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, { message: 'First name is required!' }),
  surname: z.string().min(1, { message: 'Last name is required!' }),
  email: z.string().email({ message: 'Invalid email address!' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: 'Blood Type is required!' }),
  birthday: z.coerce.date({ message: 'Birthday is required!' }),
  sex: z.enum(['MALE', 'FEMALE'], { message: 'Sex is required!' }),
  subjects: z.array(z.string()).optional(),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long!' })
    .max(20, { message: 'Username must be at most 20 characters long!' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long!' })
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, { message: 'First name is required!' }),
  surname: z.string().min(1, { message: 'Last name is required!' }),
  email: z.string().email({ message: 'Invalid email address!' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: 'Blood Type is required!' }),
  birthday: z.coerce.date({ message: 'Birthday is required!' }),
  sex: z.enum(['MALE', 'FEMALE'], { message: 'Sex is required!' }),
  gradeId: z.coerce.number().min(1, { message: 'Grade is required!' }),
  classId: z.coerce.number().min(1, { message: 'Class is required!' }),
  parentId: z.string().min(1, { message: 'Parent Id is required!' }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: 'Title name is required!' }),
  startTime: z.coerce.date({ message: 'Start time is required!' }),
  endTime: z.coerce.date({ message: 'End time is required!' }),
  lessonId: z.coerce.number({ message: 'Lesson is required!' }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long!' }).max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),

  name: z.string().min(1, { message: 'First name is required!' }),
  surname: z.string().min(1, { message: 'Last name is required!' }),
  email: z.string().email({ message: 'Invalid email address!' }).nullish(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format!' })
    .optional(),
  address: z.string().min(1, { message: 'Address is required!' }),
  studentId: z.array(z.string().min(1, 'Student selection is required')).optional(),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: 'Lesson name is required!' }),
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'], {
    message: 'Day is required!',
  }),
  startTime: z.string().min(1, { message: 'Start time is required!' }),
  endTime: z.string().min(1, { message: 'End time is required!' }),

  subjectId: z.coerce.number().min(1, { message: 'Subject is required!' }),
  classId: z.coerce.number().min(1, { message: 'Class is required!' }),
  teacherId: z.string().min(1, { message: 'Teacher is required!' }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const resultSchema = z.object({
  id: z.string().optional(),
  score: z.coerce
    .number()
    .min(0, 'Score must be a positive number')
    .max(100, 'Score must be less than or equal to 100'),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)) && Date.parse(val) !== null, {
      message: 'Invalid date',
    })
    .optional(),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),

  studentId: z.string().min(1, 'Student ID is required'),

  teacherId: z.string().min(1, 'Teacher ID is required').optional(),

  classId: z.coerce.number().min(1, { message: 'Class is required!' }),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const assignmentSchema = z
  .object({
    title: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required').or(z.date()),
    dueDate: z.string().min(1, 'Due date is required').or(z.date()),
    subjectId: z.coerce.number().optional(),
    lessonId: z.coerce.number().optional(),
    classId: z.coerce.number().min(1, { message: 'Class is required!' }),
    teacherId: z.string().min(1, 'Teacher ID is required'),
  })
  .superRefine(({ startDate, dueDate }, ctx) => {
    if (new Date(dueDate) <= new Date(startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Due date must be after start date',
        path: ['dueDate'],
      });
    }
  });

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required!'),

  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Use YYYY-MM-DD',
  }),
  startTime: z.coerce
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm)' })
    .optional(),

  endTime: z.coerce
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format (HH:mm)' })
    .optional(),

  classId: z.coerce.number().min(1, { message: 'Class is required!' }),

  description: z.string().max(500, 'Description is too long!').default(''),
});

export type EventSchema = z.infer<typeof eventSchema>;
