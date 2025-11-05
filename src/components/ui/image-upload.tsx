
'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  onChange: (files: FileList | null) => void;
}

export function ImageUpload({ onChange }: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(files);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  return (
    <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg">
      <Input
        type="file"
        id="image-upload"
        className="absolute w-full h-full opacity-0 cursor-pointer"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      {preview ? (
        <img src={preview} alt="Image preview" className="h-full w-full object-cover rounded-lg" />
      ) : (
        <div className="text-center p-4">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (max 2MB)</p>
        </div>
      )}
    </div>
  );
}

    