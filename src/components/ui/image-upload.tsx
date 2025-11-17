'use client';

import * as React from 'react';
import { useDropzone, FileRejection, Accept } from 'react-dropzone';
import { UploadCloud as ImageIcon, X } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from './button';
import Image from 'next/image';

interface ImageUploadProps {
  name: string;
  label: string;
  accept?: Accept;
  maxSize?: number;
}

export function ImageUpload({ name, label, accept, maxSize }: ImageUploadProps) {
  const { control, setValue, setError, clearErrors, formState: { errors } } = useFormContext();
  const [preview, setPreview] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const message = fileRejections[0].errors[0].message;
        setError(name, { type: 'manual', message });
        setValue(name, null, { shouldValidate: true });
        setPreview(null);
      } else if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setValue(name, file, { shouldValidate: true });
        clearErrors(name);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [name, setValue, setError, clearErrors]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // prevent triggering the dropzone
    setValue(name, null, { shouldValidate: true });
    setPreview(null);
    clearErrors(name);
  };

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Controller
        name={name}
        control={control}
        render={() => (
          <div
            {...getRootProps()}
            className={cn(
              'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
              isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/50',
              errorMessage ? 'border-destructive' : ''
            )}
          >
            <input {...getInputProps()} />
            {preview ? (
              <>
                <Image
                  src={preview}
                  alt="Image preview"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-lg p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (MAX. 5MB)</p>
              </div>
            )}
          </div>
        )}
      />
      {errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
