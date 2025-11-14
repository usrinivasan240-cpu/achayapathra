
'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  onChange: (file: File | null) => void;
}

export function ImageUpload({ onChange }: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onChange(file);
  };
  
  const handleContainerClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
        className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer"
        onClick={handleContainerClick}
    >
      <Input
        type="file"
        id="image-upload"
        ref={inputRef}
        className="sr-only"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      {preview ? (
        <img src={preview} alt="Image preview" className="h-full w-full object-cover rounded-lg" />
      ) : (
        <div className="text-center p-4">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (max 5MB)</p>
        </div>
      )}
    </div>
  );
}

    