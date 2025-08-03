import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Video, X, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  onVideoUploaded: (file: File) => void;
  isProcessing?: boolean;
  processingProgress?: number;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoUploaded,
  isProcessing = false,
  processingProgress = 0
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      onVideoUploaded(file);
    }
  }, [onVideoUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    },
    multiple: false,
    disabled: isProcessing
  });

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setUploadedFile(null);
    setVideoPreview(null);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (uploadedFile && videoPreview) {
    return (
      <Card className="p-6 bg-gradient-dark border-border shadow-card">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-semibold text-foreground">{uploadedFile.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={removeVideo}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoPreview}
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="gaming"
                size="icon"
                onClick={togglePlayback}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing video...</span>
                <span className="text-accent">{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-8 border-2 border-dashed transition-all duration-300 cursor-pointer",
      isDragActive 
        ? "border-accent bg-accent/5 shadow-glow-secondary" 
        : "border-border hover:border-accent/50 hover:bg-card/50",
      isProcessing && "cursor-not-allowed opacity-50"
    )}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className={cn(
            "p-4 rounded-full transition-all duration-300",
            isDragActive ? "bg-accent/20 shadow-glow-secondary" : "bg-muted"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragActive ? "text-accent" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isDragActive ? "Drop your Valorant recording here" : "Upload Valorant Game Recording"}
            </h3>
            <p className="text-muted-foreground">
              Drag & drop your video file or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports MP4, AVI, MOV, MKV, WebM (Max 2GB)
            </p>
          </div>

          <Button variant="gaming" size="lg" disabled={isProcessing}>
            Select Video File
          </Button>
        </div>
      </div>
    </Card>
  );
};