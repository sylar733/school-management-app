'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { parentSchema, ParentSchema } from '@/lib/formValidationSchema';
import { createParent, updateParent } from '@/lib/actions';

const ParentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      username: data?.username || '',
      name: data?.name || '',
      surname: data?.surname || '',
      email: data?.email || '',
      phone: data?.phone || '',
      address: data?.address || '',
      password: '',
      studentId: data?.students?.map((s: { id: string }) => s.id) || [], // Ensure studentId is an array
    },
  });

  type StudentType = {
    id: string;
    name: string;
    surname: string;
  };

  const router = useRouter();
  const students: StudentType[] = relatedData?.students ?? [];
  const selectedStudents = watch('studentId') || [];

  const onSubmit = async (formData: ParentSchema) => {
    try {
      let result;

      // Ensure studentId is an array
      const formattedData = {
        ...formData,
        studentId: formData.studentId ?? [],
      };

      if (type === 'create') {
        result = await createParent({ success: false, error: false }, formattedData);
      } else if (data?.id) {
        result = await updateParent(data.id, formattedData);
      }

      if (result?.success) {
        toast.success(`Parent ${type === 'create' ? 'created' : 'updated'} successfully!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result?.error || 'Operation failed.');
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      toast.error('Something went wrong.');
    }
  };

  return (
    <form className="flex flex-col gap-8 p-4" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold">{type === 'create' ? 'Add Parent' : 'Edit Parent'}</h2>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Username */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Username</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('username')}
          />
          {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
        </div>

        {/* First Name */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">First Name</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Last Name</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('surname')}
          />
          {errors.surname && <p className="text-xs text-red-400">{errors.surname.message}</p>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Email</label>
          <input
            type="email"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Password</label>
          <input
            type="password"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Phone</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('phone')}
          />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Address</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('address')}
          />
          {errors.address && <p className="text-xs text-red-400">{errors.address.message}</p>}
        </div>

        {/* Student Selection (Multiple) */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500"></label>
          <select
            multiple
            style={{ display: 'none' }}
            {...register('studentId')}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
              setValue('studentId', selectedOptions);
            }}
          >
            {students.map((student: StudentType) => (
              <option key={student.id} value={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>

          {errors.studentId && <p className="text-xs text-red-400">{errors.studentId.message}</p>}
        </div>
      </div>

      {/* Buttons */}
      <button className="bg-blue-400 text-white p-2 rounded-md" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default ParentForm;
