'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { resultSchema, ResultSchema } from '@/lib/formValidationSchema';
import { createResult, updateResult } from '@/lib/actions';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    resultStudents: { id: string; name: string; surname: string }[];
    classes: { id: number; name: string }[];
    teachers: { id: string; name: string; surname: string }[];
    exams: { id: number; title: string }[];
    assignments: { id: number; title: string }[];
  };
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    resultStudents = [],
    classes = [],
    teachers = [],
    exams = [],
    assignments = [],
  } = relatedData ?? {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      score: data?.score ?? 0,
      examId: data?.examId ?? undefined,
      assignmentId: data?.assignmentId ?? undefined,
      studentId: data?.studentId ?? '',
      teacherId: data?.teacherId ?? undefined,
      classId: data?.classId ?? undefined,
      date: data?.date ?? '',
    },
  });

  const [state, formAction] = useFormState(createResult, {
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit(async (formData) => {
    console.log('Submitted Data:', formData);

    const formattedData = {
      ...formData,
      score: Number(formData.score),
      examId: formData.examId ? Number(formData.examId) : undefined,
      assignmentId: formData.assignmentId ? Number(formData.assignmentId) : undefined,
      classId: Number(formData.classId),
      teacherId: formData.teacherId ? String(formData.teacherId) : undefined,
      studentId: String(formData.studentId),
      date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      id: type === 'update' ? data?.id : undefined,
    };

    console.log('Formatted Data:', formattedData);

    setLoading(true);

    if (type === 'update') {
      // Call the update function
      const response = await updateResult(state, formattedData);
      if (response.success) {
        toast.success('Result updated successfully!');
        setOpen(false);
        router.refresh();
      } else {
        toast.error('Failed to update result. Please try again.');
      }
    } else {
      // Call the create function
      formAction(formattedData);
    }

    setLoading(false);
  });

  useEffect(() => {
    if (state.success && type === 'create') {
      toast.success('Result created successfully!');
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new result' : 'Update result'}
      </h1>

      <div className="flex flex-wrap gap-4">
        {/* Score */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Score</label>
          <input
            type="number"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('score')}
          />
          {errors.score?.message && <p className="text-xs text-red-400">{errors.score.message}</p>}
        </div>

        {/* Exam Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Exam</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('examId')}
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          {errors.examId?.message && (
            <p className="text-xs text-red-400">{errors.examId.message}</p>
          )}
        </div>

        {/* Assignment Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Assignment</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('assignmentId')}
          >
            <option value="">Select Assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
          {errors.assignmentId?.message && (
            <p className="text-xs text-red-400">{errors.assignmentId.message}</p>
          )}
        </div>

        {/* Student Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('studentId')}
          >
            {resultStudents.map((resultStudents) => (
              <option key={resultStudents.id} value={resultStudents.id}>
                {resultStudents.name} {resultStudents.surname}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">{errors.studentId.message}</p>
          )}
        </div>
        {/* Teacher Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('teacherId')}
          >
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
        {/* Date Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('date')}
          />
          {errors.date?.message && <p className="text-xs text-red-400">{errors.date.message}</p>}
        </div>
      </div>

      {state.error && <span className="text-red-500">Something went wrong!</span>}

      <button type="submit" disabled={loading} className="bg-blue-400 text-white p-2 rounded-md">
        {loading ? 'Submitting...' : type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default ResultForm;
