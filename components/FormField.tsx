
import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text';
  placeholder?: string;
  disabled?: boolean;
  labelClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  labelClassName
}) => {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={id} className={`mb-2 font-semibold ${labelClassName || 'text-gray-300'}`}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};
