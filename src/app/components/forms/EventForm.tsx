'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { eventSchema, EventSchema } from '@/lib/formValidationSchema';
import { createEvent, updateEvent } from '@/lib/actions';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    eventClass: { id: number; name: string }[];
  };
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { eventClass = [] } = relatedData ?? {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: data?.title || '',
      description: (data?.description || '').trim() || '',
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : '',
      startTime: data?.startTime || '',
      endTime: data?.endTime || '',
      classId: data?.classId ?? undefined,
    },
  });

  const [state, formAction] = useFormState(
    (
      state: any,
      payload: {
        title: string;
        date: string | Date;
        classId: number;
        description: string;
        startTime?: string | undefined;
        endTime?: string | undefined;
      }
    ) => createEvent(payload as EventSchema),
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit(async (formData) => {
    console.log('Submitted Data:', formData);

    const formattedData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date ? new Date(formData.date).toISOString() : '', // ✅ Convert to string
      startTime: formData.startTime ? `${formData.date}T${formData.startTime}:00.000Z` : '', // ✅ Ensure valid string format
      endTime: formData.endTime ? `${formData.date}T${formData.endTime}:00.000Z` : '', // ✅ Ensure valid string format
      classId: Number(formData.classId),
    };

    console.log('Formatted Data:', formattedData);
    setLoading(true);

    if (type === 'update') {
      const response = await updateEvent(data.id, formattedData);
      if (response.success) {
        toast.success('Event updated successfully!');
        setOpen(false);
        router.refresh();
      } else {
        toast.error('Failed to update event. Please try again.');
      }
    } else {
      formAction(formattedData);
    }

    setLoading(false);
  });

  useEffect(() => {
    if (state.success && type === 'create') {
      toast.success('Event created successfully!');
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new event' : 'Update event'}
      </h1>

      <div className="flex flex-wrap gap-4">
        {/* Title */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Title</label>
          <input
            type="text"
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm"
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        {/* Class Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('classId')}
          >
            <option value="">Select Class</option>
            {eventClass.map((eventClass) => (
              <option key={eventClass.id} value={eventClass.id}>
                {eventClass.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Event Date */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Event Date</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('date')}
          />
        </div>

        {/* Start Time */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Start Time</label>
          <input
            type="time"
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm"
            {...register('startTime')}
          />
          {errors.startTime && <p className="text-xs text-red-400">{errors.startTime.message}</p>}
        </div>

        {/* End Time */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">End Time</label>
          <input
            type="time"
            className="ring-1 ring-gray-300 p-2 rounded-md text-sm"
            {...register('endTime')}
          />
          {errors.endTime && <p className="text-xs text-red-400">{errors.endTime.message}</p>}
        </div>
      </div>

      {state.error && <span className="text-red-500">Something went wrong!</span>}

      <button type="submit" disabled={loading} className="bg-blue-400 text-white p-2 rounded-md">
        {loading ? 'Submitting...' : type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default EventForm;
