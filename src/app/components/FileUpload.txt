'use client';

import React, { useState, useRef } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';


type FileUploadProps = {
    onFileSelected: (file: File) => Promise<void>;
    onError?: (error: string) => void;
};

export default function FileUpload({ onFileSelected, onError }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const clearError = () => setErrorMessage(null);

    const validateFile = (file: File): boolean => {
        const isJSON = file.type.includes('json') || file.name.toLowerCase().endsWith('.json');
        if (!isJSON) {
            const error = 'Only JSON files are allowed';
            setErrorMessage(error);
            onError?.(error);
            return false;
        }
        clearError();
        return true;
    };

    const handleFileChange = async (selectedFile: File) => {
        if (!validateFile(selectedFile)) return;
        setFile(selectedFile);
        setIsUploading(true);
        try {
            await onFileSelected(selectedFile);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error uploading file';
            setErrorMessage(msg);
            onError?.(msg);
        } finally {
            setIsUploading(false);
        }
    };

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files?.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            handleFileChange(droppedFile);
            e.dataTransfer.clearData();
        }
    };

    // Clicking triggers file input
    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // allow re-selecting same file
            fileInputRef.current.click();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileChange(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleInputChange}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <LoadingSpinner size="w-10 h-10" />
                        <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                    </div>
                ) : file ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <button
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                            }}
                        >
                            Select another file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400 mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="mb-2 text-sm font-medium text-gray-900">
                            Drag and drop your JSON file here or click to upload
                        </p>
                        <p className="text-xs text-gray-500">JSON files only</p>
                    </div>
                )}
            </div>

            {errorMessage && <div className="mt-2 text-sm text-red-600">{errorMessage}</div>}
        </div>
    );
}
