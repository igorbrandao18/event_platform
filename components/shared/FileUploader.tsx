'use client'

import { useCallback, Dispatch, SetStateAction, useState } from 'react'
import type { FileWithPath } from '@uploadthing/react'
import { useDropzone } from '@uploadthing/react/hooks'
import { generateClientDropzoneAccept } from 'uploadthing/client'
import { Button } from '@/components/ui/button'
import { convertFileToUrl } from '@/lib/utils'

type FileUploaderProps = {
  onFieldChange: (url: string) => void
  imageUrl: string
  setFiles: Dispatch<SetStateAction<File[]>>
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    try {
      if (acceptedFiles.length === 0) {
        throw new Error('Please select a valid image file');
      }

      const file = acceptedFiles[0];
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('File size must be less than 4MB');
      }

      setFiles(acceptedFiles);
      onFieldChange(convertFileToUrl(file));
      setError('');
    } catch (err) {
      console.error('Error handling file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    }
  }, [setFiles, onFieldChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(['image/*']),
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024 // 4MB
  })

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50 ${
          isDragActive ? 'border-2 border-primary-500' : ''
        }`}>
        <input {...getInputProps()} className="cursor-pointer" />

        {imageUrl ? (
          <div className="flex h-full w-full flex-1 justify-center">
            <img
              src={imageUrl}
              alt="uploaded image"
              width={250}
              height={250}
              className="w-full object-cover object-center"
            />
          </div>
        ) : (
          <div className="flex-center flex-col py-5 text-grey-500">
            <img src="/assets/icons/upload.svg" width={77} height={77} alt="file upload" />
            <h3 className="mb-2 mt-2">Drag photo here</h3>
            <p className="p-medium-12 mb-4">SVG, PNG, JPG</p>
            <Button type="button" className="rounded-full">
              Select from computer
            </Button>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}
