import { useState, useCallback } from 'react';

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

  const simulateAIProcessing = useCallback(async (
    videoFile: File,
    settings: KillDetectionSettings
  ): Promise<KillClip[]> => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('upload');
    
    // Simulate video analysis time based on file size
    const fileSizeInMB = videoFile.size / (1024 * 1024);
    const estimatedTimeInSeconds = Math.min(fileSizeInMB * 2, 300); // Max 5 minutes
    setEstimatedTime(estimatedTimeInSeconds);

    // Simulate upload phase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProgress(15);
    setCurrentStep('analysis');

    // Simulate AI analysis phase
    for (let i = 15; i <= 70; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(i);
    }
    
    setCurrentStep('extraction');
    
    // Simulate clip extraction
    for (let i = 70; i <= 95; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setCurrentStep('export');
    await new Promise(resolve => setTimeout(resolve, 500));
    setProgress(100);

    // Generate mock kill clips based on settings
    const mockClips: KillClip[] = [
      {
        id: '1',
        timestamp: 45,
        duration: settings.clipDuration,
        confidence: 95,
        weapon: 'Vandal',
        enemiesKilled: 1,
        isMultiKill: false
      },
      {
        id: '2',
        timestamp: 125,
        duration: settings.clipDuration,
        confidence: 88,
        weapon: 'Operator',
        enemiesKilled: 2,
        isMultiKill: true
      },
      {
        id: '3',
        timestamp: 203,
        duration: settings.clipDuration,
        confidence: 92,
        weapon: 'Phantom',
        enemiesKilled: 1,
        isMultiKill: false
      },
      {
        id: '4',
        timestamp: 287,
        duration: settings.clipDuration,
        confidence: 76,
        weapon: 'Sheriff',
        enemiesKilled: 1,
        isMultiKill: false
      }
    ];

    // Filter clips based on sensitivity
    const filteredClips = mockClips.filter(clip => 
      clip.confidence >= (100 - settings.sensitivity)
    );

    setClips(filteredClips);
    setIsProcessing(false);
    
    return filteredClips;
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
    simulateAIProcessing,
    downloadClip,
    downloadAllClips,
    deleteClip,
    previewClip,
    resetProcessing
  };
};