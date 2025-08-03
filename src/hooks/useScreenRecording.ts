import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ScreenSource {
  id: string;
  name: string;
  thumbnail: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  source: ScreenSource | null;
}

export const useScreenRecording = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    source: null
  });
  const [availableSources, setAvailableSources] = useState<ScreenSource[]>([]);
  const [isValorantRunning, setIsValorantRunning] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Get available screen sources
  const getScreenSources = useCallback(async () => {
    if (window.electronAPI) {
      try {
        const sources = await window.electronAPI.getScreenSources();
        const formattedSources = sources.map((source: any) => ({
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL()
        }));
        setAvailableSources(formattedSources);
        return formattedSources;
      } catch (error) {
        console.error('Error getting screen sources:', error);
        toast({
          title: "Error",
          description: "Failed to get screen sources",
          variant: "destructive"
        });
        return [];
      }
    }
    return [];
  }, [toast]);

  // Start recording with selected source
  const startRecording = useCallback(async (sourceId: string) => {
    try {
      const selectedSource = availableSources.find(source => source.id === sourceId);
      if (!selectedSource) {
        throw new Error('Invalid source selected');
      }

      // Get screen stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        } as any,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: 1280,
            maxWidth: 1920,
            minHeight: 720,
            maxHeight: 1080,
            minFrameRate: 30,
            maxFrameRate: 60
          }
        } as any
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const buffer = await blob.arrayBuffer();
        const filename = `valorant-recording-${Date.now()}.webm`;
        
        if (window.electronAPI) {
          const result = await window.electronAPI.saveRecording(Buffer.from(buffer), filename);
          if (result.success) {
            toast({
              title: "Recording Saved",
              description: `Recording saved to: ${result.path}`
            });
          } else {
            toast({
              title: "Save Failed",
              description: result.error || "Failed to save recording",
              variant: "destructive"
            });
          }
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Capture data every second

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        source: selectedSource
      });

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);

      if (window.electronAPI) {
        window.electronAPI.onRecordingStart();
      }

      toast({
        title: "Recording Started",
        description: `Recording ${selectedSource.name}`
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Failed to start screen recording",
        variant: "destructive"
      });
    }
  }, [availableSources, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      source: null
    });

    if (window.electronAPI) {
      window.electronAPI.onRecordingStop();
    }

    toast({
      title: "Recording Stopped",
      description: "Recording has been saved"
    });
  }, [toast]);

  // Auto-start recording when Valorant is detected
  const autoStartRecording = useCallback(async () => {
    if (isValorantRunning && !recordingState.isRecording) {
      const sources = await getScreenSources();
      const valorantWindow = sources.find(source => 
        source.name.toLowerCase().includes('valorant') ||
        source.name.toLowerCase().includes('riot')
      );
      
      if (valorantWindow) {
        startRecording(valorantWindow.id);
      } else {
        // Fallback to primary screen
        const primaryScreen = sources.find(source => 
          source.name.toLowerCase().includes('screen') ||
          source.name.toLowerCase().includes('entire')
        );
        if (primaryScreen) {
          startRecording(primaryScreen.id);
        }
      }
    }
  }, [isValorantRunning, recordingState.isRecording, getScreenSources, startRecording]);

  // Setup Electron listeners
  useEffect(() => {
    if (window.electronAPI) {
      // Listen for Valorant status
      window.electronAPI.onValorantStatus((isRunning: boolean) => {
        setIsValorantRunning(isRunning);
      });

      // Listen for screen sources
      window.electronAPI.onScreenSources((sources: any[]) => {
        const formattedSources = sources.map(source => ({
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail.toDataURL()
        }));
        setAvailableSources(formattedSources);
      });

      // Listen for stop recording from tray
      window.electronAPI.onStopRecording(() => {
        stopRecording();
      });

      return () => {
        window.electronAPI.removeAllListeners('valorant-status');
        window.electronAPI.removeAllListeners('screen-sources');
        window.electronAPI.removeAllListeners('stop-recording');
      };
    }
  }, [stopRecording]);

  // Auto-start recording when Valorant is detected
  useEffect(() => {
    if (isValorantRunning && !recordingState.isRecording) {
      // Delay auto-start to ensure Valorant is fully loaded
      const timeout = setTimeout(() => {
        autoStartRecording();
      }, 5000); // 5 second delay

      return () => clearTimeout(timeout);
    }
  }, [isValorantRunning, recordingState.isRecording, autoStartRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    recordingState,
    availableSources,
    isValorantRunning,
    getScreenSources,
    startRecording,
    stopRecording,
    formatDuration
  };
};