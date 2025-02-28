'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { assignmentSchema, AssignmentSchema } from '@/lib/formValidationSchema';
import { createAssignment, updateAssignment } from '@/lib/actions';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    assignmentClass: { id: number; name: string }[];
    assignmentTeachers: { id: string; name: string; surname: string }[];
    assignmentLessons?: { subjectId: number; id: number; name: string }[];
    assignmentSubjects?: { id: number; name: string }[];
  };
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    assignmentClass = [],
    assignmentTeachers = [],
    assignmentLessons = [],
    assignmentSubjects = [],
  } = relatedData ?? {};

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: data?.title || '',
      startDate: data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
      dueDate: data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
      lessonId: data?.lessonId ?? 0, // Default to 0
      classId: data?.classId ?? 0, // Default to 0
      subjectId: data?.subjectId ?? 0, // Default to 0
      teacherId: data?.teacherId ?? '', // Default to empty string
    },
  });

  const handleSubmitWithDebug = handleSubmit(
    (data) => {
      console.log('🔥 Submitted Data:', data);
      onSubmit(data);
    },
    (error) => {
      console.error('❌ Validation Errors:', error);
    }
  );

  const [selectedSubject, setSelectedSubject] = useState('');
  const [filteredLessons, setFilteredLessons] = useState(assignmentLessons);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    setValue('lessonId', 0); // Reset lesson selection

    if (subjectId) {
      setFilteredLessons(
        assignmentLessons.filter((lesson) => lesson.subjectId === Number(subjectId))
      );
    } else {
      setFilteredLessons(assignmentLessons);
    }
  };

  const onSubmit = async (formData: AssignmentSchema) => {
    console.log('🔥 Before Formatting:', formData);
    console.log('🚨 Form Errors:', errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the form errors.');
      return;
    }

    setLoading(true);

    const formattedData = {
      title: formData.title || '',
      startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
      lessonId: formData.lessonId ? Number(formData.lessonId) : undefined,
      classId: formData.classId ? Number(formData.classId) : 0,
      subjectId: formData.subjectId ? Number(formData.subjectId) : undefined,
      teacherId: formData.teacherId || '',
    };

    console.log('🚀 Formatted Data:', formattedData); // If this doesn't show, function exits earlier.

    try {
      let response;
      if (type === 'update') {
        if (!data?.id) {
          toast.error('Missing assignment ID for update.');
          return;
        }
        response = await updateAssignment(data.id, formattedData);
      } else {
        response = await createAssignment(formattedData);
      }

      console.log('🔄 API Response:', response);

      if (response?.success) {
        toast.success(`Assignment ${type === 'create' ? 'created' : 'updated'} successfully!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(`Failed to ${type === 'create' ? 'create' : 'update'} assignment.`);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      toast.error('An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmitWithDebug}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new assignment' : 'Update assignment'}
      </h1>

      <div className="flex flex-wrap gap-4">
        {/* Title Input */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Title</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('title')}
            placeholder="Enter Assignment Title"
          />
          {errors.title?.message && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        {/* Subject Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            onChange={handleSubjectChange}
          >
            <option value="">Select Subject</option>
            {assignmentSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lesson Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('lessonId')}
          >
            <option value="">Select Lesson</option>
            {filteredLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
        </div>

        {/* Class Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('classId')}
          >
            <option value="">Select Class</option>
            {assignmentClass.map((assignmentClass) => (
              <option key={assignmentClass.id} value={assignmentClass.id}>
                {assignmentClass.name}
              </option>
            ))}
          </select>
        </div>

        {/* Teacher Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('teacherId')}
          >
            <option value="">Select Teacher</option>
            {assignmentTeachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message}</p>
          )}
        </div>
        {/* Start Date */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Start Date</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('startDate')}
          />
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Due Date</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('dueDate')}
          />
        </div>
      </div>

      {loading && <p className="text-blue-500">Submitting...</p>}

      <button type="submit" disabled={loading} className="bg-blue-400 text-white p-2 rounded-md">
        {loading ? 'Submitting...' : type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default AssignmentForm;
