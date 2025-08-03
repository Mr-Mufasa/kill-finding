import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Download, Eye, Clock, Target, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HighlightReelSettingsComponent } from '@/components/HighlightReelSettings';
import { HighlightReelSettings } from '@/lib/ai/videoCompiler';

interface KillClip {
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

interface KillClipResultsProps {
  clips: KillClip[];
  isGenerating?: boolean;
  isGeneratingReel?: boolean;
  highlightReelProgress?: number;
  onPreviewClip: (clip: KillClip) => void;
  onDownloadClip: (clip: KillClip) => void;
  onDownloadAll: () => void;
  onDeleteClip: (clipId: string) => void;
  onGenerateHighlightReel: (settings: HighlightReelSettings) => void;
}

export const KillClipResults: React.FC<KillClipResultsProps> = ({
  clips,
  isGenerating = false,
  isGeneratingReel = false,
  highlightReelProgress = 0,
  onPreviewClip,
  onDownloadClip,
  onDownloadAll,
  onDeleteClip,
  onGenerateHighlightReel
}) => {
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWeaponIcon = (weapon: string) => {
    // In a real app, you'd have weapon-specific icons
    return <Target className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 70) return 'text-warning';
    return 'text-muted-foreground';
  };

  const toggleClipSelection = (clipId: string) => {
    const newSelection = new Set(selectedClips);
    if (newSelection.has(clipId)) {
      newSelection.delete(clipId);
    } else {
      newSelection.add(clipId);
    }
    setSelectedClips(newSelection);
  };

  if (isGenerating) {
    return (
      <Card className="p-6 bg-gradient-dark border-border shadow-card">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <h3 className="text-lg font-semibold text-foreground">Analyzing Gameplay</h3>
          </div>
          <p className="text-muted-foreground">
            AI is detecting kills and creating clips...
          </p>
          <Progress value={65} className="w-full max-w-md mx-auto" />
        </div>
      </Card>
    );
  }

  if (isGeneratingReel) {
    return (
      <Card className="p-6 bg-gradient-dark border-border shadow-card">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <h3 className="text-lg font-semibold text-foreground">Generating Highlight Reel</h3>
          </div>
          <p className="text-muted-foreground">
            Compiling all kills into one continuous video...
          </p>
          <Progress value={highlightReelProgress} className="w-full max-w-md mx-auto" />
          <p className="text-sm text-muted-foreground">
            {highlightReelProgress < 25 ? 'Loading video...' :
             highlightReelProgress < 50 ? 'Initializing compiler...' :
             highlightReelProgress < 90 ? 'Compiling video segments...' :
             'Finalizing highlight reel...'}
          </p>
        </div>
      </Card>
    );
  }

  if (clips.length === 0) {
    return (
      <Card className="p-6 bg-gradient-dark border-border shadow-card">
        <div className="text-center space-y-4">
          <Target className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">No Kills Detected</h3>
            <p className="text-muted-foreground">
              Try adjusting the detection settings or upload a different recording.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Highlight Reel Settings */}
      <HighlightReelSettingsComponent
        onGenerateReel={onGenerateHighlightReel}
        isGenerating={isGeneratingReel}
        clipCount={clips.length}
      />

      <Card className="p-6 bg-gradient-dark border-border shadow-card">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Individual Clips</h3>
              <Badge variant="secondary" className="bg-gradient-accent">
                {clips.length} clips
              </Badge>
            </div>
          
          <div className="flex gap-2">
            {selectedClips.size > 0 && (
              <Button variant="outline" size="sm">
                Download Selected ({selectedClips.size})
              </Button>
            )}
            <Button variant="gaming" onClick={onDownloadAll}>
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-300 cursor-pointer",
                selectedClips.has(clip.id)
                  ? "border-accent bg-accent/5 shadow-glow-secondary"
                  : "border-border bg-muted/30 hover:border-accent/50"
              )}
              onClick={() => toggleClipSelection(clip.id)}
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail/Preview */}
                <div className="w-24 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {clip.thumbnailUrl ? (
                    <img
                      src={clip.thumbnailUrl}
                      alt="Clip thumbnail"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Play className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                {/* Clip Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {formatTime(clip.timestamp)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({clip.duration}s)
                    </span>
                    
                    {clip.isMultiKill && (
                      <Badge variant="secondary" className="bg-gradient-primary text-xs">
                        Multi-Kill
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {getWeaponIcon(clip.weapon)}
                      <span className="text-muted-foreground">{clip.weapon}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {clip.enemiesKilled} {clip.enemiesKilled === 1 ? 'kill' : 'kills'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <span className={cn("text-xs font-medium", getConfidenceColor(clip.confidence))}>
                        {clip.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewClip(clip);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="gaming"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadClip(clip);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClip(clip.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {clips.length > 3 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Total clips: <span className="font-medium">{clips.length}</span> • 
              Total duration: <span className="font-medium">
                {formatTime(clips.reduce((acc, clip) => acc + clip.duration, 0))}
              </span>
            </p>
          </div>
        )}
        </div>
      </Card>
    </div>
  );
};