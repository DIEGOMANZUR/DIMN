import React from 'react';

interface ImageDisplayProps {
  title: string;
  imageBase64?: string | null;
  isLoading: boolean;
  titleClassName?: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  title,
  imageBase64,
  isLoading,
  titleClassName,
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className={`text-xl font-bold mb-4 text-gray-200 ${titleClassName || ''}`}>{title}</h3>
      <div className="w-full max-w-lg aspect-[3/4] bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center text-gray-400">
            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2">Generando tu obra maestra...</p>
          </div>
        ) : imageBase64 ? (
          <img
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt={title}
            className="w-full h-full object-contain"
          />
        ) : (
          <p className="text-gray-500">Tu lámina aparecerá aquí</p>
        )}
      </div>
    </div>
  );
};