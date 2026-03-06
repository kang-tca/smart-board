
import React, { useRef } from 'react';
import { Icon } from './Icon';

interface FileUploadButtonProps {
  onFileChange: (files: File[]) => void;
  isLoading: boolean;
  title: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileChange, isLoading, title }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileChange(Array.from(files));
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf"
        className="hidden"
        disabled={isLoading}
        multiple
      />
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={title}
        className={`flex items-center justify-center ${isLoading ? 'px-4 py-2' : 'p-2'} bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <Icon name="upload" />
        )}
      </button>
    </>
  );
};