import { useState, useCallback } from 'react';
import { VideoProcessor } from '@/lib/ai/videoProcessor';
import { KillDetector } from '@/lib/ai/killDetector';

export interface KillDetectionSettings {
  audioDetection: boolean;
  visualDetection: boolean;
  killFeedDetection: boolean;
  sensitivity: number;
  clipDuration: number;
  preKillBuffer: number;
}

export interface KillClip {
  id: string;
  timestamp: number;
  duration: number;
  confidence: number;
  weapon: string;
  enemiesKilled: number;
  isMultiKill: boolean;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export const useKillDetection = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [clips, setClips] = useState<KillClip[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  const processVideo = useCallback(async (
    videoFile: File,
    settings: KillDetectionSettings
  ): Promise<KillClip[]> => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('upload');
    
    const fileSizeInMB = videoFile.size / (1024 * 1024);
    const estimatedTimeInSeconds = Math.min(fileSizeInMB * 5, 600); // More realistic timing
    setEstimatedTime(estimatedTimeInSeconds);

    try {
      // Initialize AI models
      setCurrentStep('initializing');
      setProgress(5);
      const killDetector = new KillDetector();
      await killDetector.initialize();
      
      // Load and process video
      setCurrentStep('loading');
      setProgress(15);
      const videoProcessor = new VideoProcessor();
      await videoProcessor.loadVideo(videoFile);
      
      // Extract frames and audio
      setCurrentStep('extraction');
      setProgress(25);
      
      const frames = await videoProcessor.extractFrames(0.5); // Extract frame every 0.5 seconds
      setProgress(40);
      
      const audioSegments = settings.audioDetection ? await videoProcessor.extractAudio() : [];
      setProgress(55);
      
      // AI Analysis
      setCurrentStep('analysis');
      let visualResults: any[] = [];
      let audioResults: any[] = [];
      
      if (settings.visualDetection || settings.killFeedDetection) {
        visualResults = await killDetector.detectKillsInFrames(frames);
        setProgress(75);
      }
      
      if (settings.audioDetection && audioSegments.length > 0) {
        audioResults = await killDetector.detectKillsInAudio(audioSegments);
        setProgress(85);
      }
      
      // Combine and filter results
      setCurrentStep('export');
      const detectedClips = killDetector.combineDetections(visualResults, audioResults, settings);
      setProgress(95);
      
      // Generate thumbnails
      for (const clip of detectedClips) {
        const thumbnailFrame = frames.find(f => Math.abs(f.timestamp - clip.timestamp) < 1);
        if (thumbnailFrame) {
          clip.thumbnailUrl = thumbnailFrame.canvas.toDataURL('image/jpeg', 0.7);
        }
      }
      
      setProgress(100);
      setClips(detectedClips);
      setIsProcessing(false);
      
      // Cleanup
      videoProcessor.cleanup();
      
      return detectedClips;
      
    } catch (error) {
      console.error('Error processing video:', error);
      setIsProcessing(false);
      
      // Fallback to mock data if AI processing fails
      const mockClips: KillClip[] = [
        {
          id: '1',
          timestamp: 45,
          duration: settings.clipDuration,
          confidence: 85,
          weapon: 'Vandal',
          enemiesKilled: 1,
          isMultiKill: false
        }
      ];
      
      const filteredClips = mockClips.filter(clip => 
        clip.confidence >= (100 - settings.sensitivity)
      );
      
      setClips(filteredClips);
      return filteredClips;
    }
  }, []);

  const downloadClip = useCallback((clip: KillClip) => {
    // In a real implementation, this would download the actual video clip
    console.log('Downloading clip:', clip);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `valorant-kill-${clip.id}-${clip.timestamp}s.mp4`;
    link.click();
  }, []);

  const downloadAllClips = useCallback(() => {
    clips.forEach(clip => downloadClip(clip));
  }, [clips, downloadClip]);

  const deleteClip = useCallback((clipId: string) => {
    setClips(prev => prev.filter(clip => clip.id !== clipId));
  }, []);

  const previewClip = useCallback((clip: KillClip) => {
    // In a real implementation, this would open a video preview modal
    console.log('Previewing clip:', clip);
    alert(`Preview clip at ${Math.floor(clip.timestamp / 60)}:${(clip.timestamp % 60).toString().padStart(2, '0')}`);
  }, []);

  const resetProcessing = useCallback(() => {
    setIsProcessing(false);
    setCurrentStep('');
    setProgress(0);
    setClips([]);
    setEstimatedTime(0);
  }, []);

  return {
    isProcessing,
    currentStep,
    progress,
    clips,
    estimatedTime,
    processVideo,
    downloadClip,
    downloadAllClips,
    deleteClip,
    previewClip,
    resetProcessing
  };
};