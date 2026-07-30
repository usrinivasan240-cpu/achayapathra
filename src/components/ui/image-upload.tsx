'use client';

import * as React from 'react';
import { useDropzone, FileRejection, Accept } from 'react-dropzone';
import { UploadCloud as ImageIcon, X, Camera } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from './button';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './alert';

// CameraCapture component defined inside image-upload.tsx
const CameraCapture = ({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const getCameraPermission = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser.');
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description:
            'Please enable camera permissions in your browser settings.',
        });
        onClose();
      }
    };

    getCameraPermission();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          onCapture(file);
        }
        onClose();
      }, 'image/jpeg');

      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  if (hasCameraPermission === false) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
            Could not access the camera. Please ensure you have granted permission in your browser settings.
            </AlertDescription>
        </Alert>
    );
  }

  if (hasCameraPermission === null) {
      return <div className="flex items-center justify-center h-48">Requesting camera access...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full aspect-video rounded-md bg-muted"
          autoPlay
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCapture}>Capture Photo</Button>
      </div>
    </div>
  );
};


interface ImageUploadProps {
  name: string;
  label: string;
  accept?: Accept;
  maxSize?: number;
}

export function ImageUpload({ name, label, accept, maxSize }: ImageUploadProps) {
  const { control, setValue, setError, clearErrors, formState: { errors } } = useFormContext();
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);

  const processFile = React.useCallback((file: File) => {
    // Validate file type against the `accept` prop, which contains MIME types.
    const acceptedMimeTypes = accept ? Object.keys(accept) : [];
    if (acceptedMimeTypes.length > 0) {
        const fileType = file.type;
        const isAllowed = acceptedMimeTypes.some(pattern => {
            // Handle wildcards like 'image/*'
            if (pattern.endsWith('/*')) {
                return fileType.startsWith(pattern.slice(0, -1));
            }
            return fileType === pattern;
        });

        if (!isAllowed) {
             setError(name, { type: 'manual', message: 'Invalid file type.' });
             return;
        }
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
        setError(name, { type: 'manual', message: `File is too large (max ${maxSize / 1024 / 1024}MB).` });
        return;
    }

    setValue(name, file, { shouldValidate: true });
    clearErrors(name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, accept, maxSize, setValue, setError, clearErrors]);


  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const message = fileRejections[0].errors[0].message;
        setError(name, { type: 'manual', message });
        setValue(name, null, { shouldValidate: true });
        setPreview(null);
      } else if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        processFile(file);
      }
    },
    [name, processFile, setError, setValue]
  );

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    noClick: true, // We manage clicks ourselves
    noKeyboard: true,
  });

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // prevent triggering the dropzone
    setValue(name, null, { shouldValidate: true });
    setPreview(null);
    clearErrors(name);
  };

  const handleCameraCapture = (file: File) => {
    processFile(file);
  }

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
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
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center w-full">
                <button type="button" onClick={openFileDialog} className="flex flex-col items-center p-4">
                    <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (MAX. 5MB)</p>
                </button>
                <div className="relative flex items-center my-2 w-full px-8">
                  <div className="flex-grow border-t border-muted-foreground/30"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
                  <div className="flex-grow border-t border-muted-foreground/30"></div>
                </div>
                <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); } }>
                            <Camera className="mr-2 h-4 w-4" /> Use Camera
                        </Button>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Capture Food Image</DialogTitle>
                        </DialogHeader>
                        {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
                    </DialogContent>
                </Dialog>
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
