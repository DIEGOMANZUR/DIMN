import React from 'react';
import { Icon } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: 'sparkles' | 'download' | 'upload' | 'edit' | 'save' | 'trash';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  icon,
  className,
  ...props
}) => {
  const baseClasses = "flex items-center justify-center px-6 py-3 font-semibold rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const themeClasses = "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed";

  return (
    <button
      className={`${baseClasses} ${themeClasses} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon && <Icon type={icon} className="w-5 h-5 mr-2" />
      )}
      {isLoading ? 'Processing...' : children}
    </button>
  );
};
