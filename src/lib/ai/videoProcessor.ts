import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface VideoFrame {
  canvas: HTMLCanvasElement;
  timestamp: number;
}

export interface AudioSegment {
  data: Float32Array;
  timestamp: number;
  sampleRate: number;
}

export class VideoProcessor {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.video = document.createElement('video');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.video.muted = true;
  }

  async loadVideo(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      this.video.onloadedmetadata = () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        resolve();
      };
      this.video.onerror = reject;
      this.video.src = URL.createObjectURL(file);
    });
  }

  async extractFrames(intervalSeconds: number = 0.5): Promise<VideoFrame[]> {
    const frames: VideoFrame[] = [];
    const duration = this.video.duration;
    
    for (let time = 0; time < duration; time += intervalSeconds) {
      this.video.currentTime = time;
      await new Promise(resolve => {
        this.video.onseeked = resolve;
      });
      
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      
      // Create a copy of the canvas
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = this.canvas.width;
      frameCanvas.height = this.canvas.height;
      const frameCtx = frameCanvas.getContext('2d')!;
      frameCtx.drawImage(this.canvas, 0, 0);
      
      frames.push({
        canvas: frameCanvas,
        timestamp: time
      });
    }
    
    return frames;
  }

  async extractAudio(): Promise<AudioSegment[]> {
    const audioContext = new AudioContext();
    const audioBuffer = await this.getAudioBuffer(audioContext);
    
    if (!audioBuffer) return [];
    
    const segments: AudioSegment[] = [];
    const segmentDuration = 1; // 1 second segments
    const samplesPerSegment = audioBuffer.sampleRate * segmentDuration;
    
    for (let i = 0; i < audioBuffer.length; i += samplesPerSegment) {
      const segmentData = audioBuffer.getChannelData(0).slice(i, i + samplesPerSegment);
      segments.push({
        data: segmentData,
        timestamp: i / audioBuffer.sampleRate,
        sampleRate: audioBuffer.sampleRate
      });
    }
    
    return segments;
  }

  private async getAudioBuffer(audioContext: AudioContext): Promise<AudioBuffer | null> {
    try {
      const response = await fetch(this.video.src);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error extracting audio:', error);
      return null;
    }
  }

  async extractVideoSegment(startTime: number, duration: number): Promise<Blob> {
    if (!this.video) {
      throw new Error('No video loaded');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error('MediaRecorder error'));
      };

      this.video.currentTime = startTime;
      this.video.onseeked = () => {
        mediaRecorder.start();
        this.video.play();

        const recordFrame = () => {
          if (this.video.currentTime >= startTime + duration) {
            mediaRecorder.stop();
            this.video.pause();
            return;
          }

          ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(recordFrame);
        };

        recordFrame();
      };
    });
  }

  cleanup() {
    if (this.video.src) {
      URL.revokeObjectURL(this.video.src);
    }
  }
}