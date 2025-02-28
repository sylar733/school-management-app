'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '../InputField';
import { lessonSchema, LessonSchema } from '@/lib/formValidationSchema';
import { createLesson, updateLesson } from '@/lib/actions';
import { useFormState } from 'react-dom';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
  };
}) => {
  const router = useRouter();
  const { teachers = [], subjects = [], classes = [] } = relatedData ?? {};

  console.log('LessonForm relatedData:', relatedData);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      subjectId: data?.subjectId ?? 0,
      classId: data?.classId ?? 0,
      teacherId: data?.teacherId || '',
      day: data?.day || '',
      startTime: data?.startTime || '',
      endTime: data?.endTime || '',
    },
  });

  const [state, formAction] = useFormState(type === 'create' ? createLesson : updateLesson, {
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit((formData) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const formattedData = {
      ...formData,
      subjectId: Number(formData.subjectId), // Convert to number
      classId: Number(formData.classId), // Convert to number
      startTime: new Date(`${today}T${formData.startTime}:00.000Z`).toISOString(), // Convert to full DateTime
      endTime: new Date(`${today}T${formData.endTime}:00.000Z`).toISOString(), // Convert to full DateTime
    };

    formAction(formattedData);
  });

  useEffect(() => {
    if (state.success) {
      console.log('LessonForm relatedData:', relatedData);

      toast.success(`Lesson has been ${type === 'create' ? 'created' : 'updated'}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new lesson' : 'Update the lesson'}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Lesson Name */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson Name</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('name', { required: 'Lesson name is required' })}
          />
          {errors.name?.message && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        {/* Subject Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('subjectId')}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
          )}
        </div>

        {/* Class Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('classId')}
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        {/* Teacher Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('teacherId')}
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message}</p>
          )}
        </div>

        {/* Day Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('day')}
          >
            <option value="">Select Day</option>
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.day?.message && <p className="text-xs text-red-400">{errors.day.message}</p>}
        </div>

        {/* Start Time */}
        <InputField
          label="Start Time"
          name="startTime"
          type="time"
          register={register}
          error={errors?.startTime}
        />

        {/* End Time */}
        <InputField
          label="End Time"
          name="endTime"
          type="time"
          register={register}
          error={errors?.endTime}
        />
      </div>

      {state.error && <span className="text-red-500">Something went wrong!</span>}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default LessonForm;
