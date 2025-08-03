import React, { useState } from 'react';
import { VideoUpload } from '@/components/VideoUpload';
import { KillDetectionSettings } from '@/components/KillDetectionSettings';
import { ProcessingPipeline } from '@/components/ProcessingPipeline';
import { KillClipResults } from '@/components/KillClipResults';
import { HighlightReelSettings } from '@/lib/ai/videoCompiler';
import { DesktopRecordingControls } from '@/components/DesktopRecordingControls';
import { DownloadDesktopApp } from '@/components/DownloadDesktopApp';
import { useKillDetection, KillDetectionSettings as Settings } from '@/hooks/useKillDetection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Zap, Brain, Github, Monitor } from 'lucide-react';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<Settings>({
    audioDetection: true,
    visualDetection: true,
    killFeedDetection: true,
    sensitivity: 80,
    clipDuration: 15,
    preKillBuffer: 3
  });

  const {
    isProcessing,
    currentStep,
    progress,
    clips,
    estimatedTime,
    isGeneratingReel,
    highlightReelProgress,
    processVideo,
    downloadClip,
    downloadAllClips,
    deleteClip,
    previewClip,
    generateHighlightReel,
    resetProcessing
  } = useKillDetection();

  const handleVideoUpload = (file: File) => {
    setUploadedFile(file);
    resetProcessing();
  };

  const handleStartProcessing = async () => {
    if (!uploadedFile) return;
    await processVideo(uploadedFile, settings);
  };

  const handleGenerateHighlightReel = async (reelSettings: HighlightReelSettings) => {
    if (!uploadedFile) return;
    
    try {
      await generateHighlightReel(uploadedFile, reelSettings);
    } catch (error) {
      console.error('Error generating highlight reel:', error);
    }
  };

  const handleNewUpload = () => {
    setUploadedFile(null);
    resetProcessing();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-dark">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-lg shadow-glow-primary">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Valorant Kill Extractor</h1>
                  <p className="text-sm text-muted-foreground">AI-powered highlight detection</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gradient-accent">
                <Brain className="w-3 h-3 mr-1" />
                Beta
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4 mr-2" />
                View Source
              </Button>
              {uploadedFile && (
                <Button variant="outline" onClick={handleNewUpload}>
                  New Upload
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          {!uploadedFile && !isProcessing && clips.length === 0 && (
            <div className="text-center space-y-6 py-12">
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-foreground">
                  Extract Your Best{' '}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Valorant Moments
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Upload your Valorant gameplay recordings and let our AI automatically detect and extract 
                  your kill highlights with precision.
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 py-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="text-foreground">AI-Powered Detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-accent" />
                  <span className="text-foreground">Automatic Highlights</span>
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-accent" />
                  <span className="text-foreground">Smart Extraction</span>
                </div>
              </div>
            </div>
          )}

          {/* Upload/Recording Section */}
          {!uploadedFile && (
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload Video</TabsTrigger>
                <TabsTrigger value="record" className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Desktop Recording
                </TabsTrigger>
                <TabsTrigger value="download">Download App</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-6">
                <VideoUpload
                  onVideoUploaded={handleVideoUpload}
                  isProcessing={isProcessing}
                  processingProgress={progress}
                />
              </TabsContent>
              <TabsContent value="record" className="mt-6">
                <DesktopRecordingControls />
              </TabsContent>
              <TabsContent value="download" className="mt-6">
                <DownloadDesktopApp />
              </TabsContent>
            </Tabs>
          )}

          {/* Settings and Processing */}
          {uploadedFile && !isProcessing && clips.length === 0 && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <VideoUpload
                  onVideoUploaded={handleVideoUpload}
                  isProcessing={isProcessing}
                  processingProgress={progress}
                />
              </div>
              <KillDetectionSettings
                settings={settings}
                onChange={setSettings}
                onStartProcessing={handleStartProcessing}
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Processing Pipeline */}
          {(isProcessing || progress > 0) && (
            <ProcessingPipeline
              isProcessing={isProcessing}
              currentStep={currentStep}
              progress={progress}
              estimatedTime={estimatedTime}
            />
          )}

          {/* Results */}
          {clips.length > 0 && (
            <KillClipResults
              clips={clips}
              isGenerating={isProcessing}
              isGeneratingReel={isGeneratingReel}
              highlightReelProgress={highlightReelProgress}
              onPreviewClip={previewClip}
              onDownloadClip={downloadClip}
              onDownloadAll={downloadAllClips}
              onDeleteClip={deleteClip}
              onGenerateHighlightReel={handleGenerateHighlightReel}
            />
          )}

          {/* AI Implementation Info */}
          {!uploadedFile && (
            <div className="bg-gradient-dark rounded-xl p-8 border border-border shadow-card">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    How Our AI Detection Works
                  </h3>
                  <p className="text-muted-foreground">
                    Advanced computer vision and audio analysis for accurate kill detection
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center shadow-glow-primary">
                      <Zap className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground">Kill Feed Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      OCR detection of kill notifications in the game UI with weapon and enemy identification
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-lg mx-auto flex items-center justify-center shadow-glow-secondary">
                      <Brain className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground">Audio Recognition</h4>
                    <p className="text-sm text-muted-foreground">
                      Machine learning models trained on Valorant kill sounds and audio cues
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-accent rounded-lg mx-auto flex items-center justify-center">
                      <Target className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground">Visual Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      Computer vision analysis of crosshair placement, enemy elimination indicators
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
