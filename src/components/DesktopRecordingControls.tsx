import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Square, 
  Monitor, 
  Gamepad2, 
  Circle,
  Settings,
  Minimize2
} from 'lucide-react';
import { useScreenRecording, ScreenSource } from '@/hooks/useScreenRecording';

export const DesktopRecordingControls = () => {
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const {
    recordingState,
    availableSources,
    isValorantRunning,
    getScreenSources,
    startRecording,
    stopRecording,
    formatDuration
  } = useScreenRecording();

  const handleStartRecording = async () => {
    try {
      const sources = await getScreenSources();
      if (sources.length === 0) {
        console.error('No screen sources available');
        return;
      }
      setShowSourceSelector(true);
    } catch (error) {
      console.error('Error getting screen sources:', error);
    }
  };

  const handleSourceSelect = (sourceId: string) => {
    startRecording(sourceId);
    setShowSourceSelector(false);
  };

  const handleAutoRecord = async () => {
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
  };

  if (showSourceSelector) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Select Screen/Window to Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 gap-4">
              {availableSources.map((source) => (
                <div
                  key={source.id}
                  className="cursor-pointer rounded-lg border p-4 hover:bg-accent transition-colors"
                  onClick={() => handleSourceSelect(source.id)}
                >
                  <img 
                    src={source.thumbnail} 
                    alt={source.name}
                    className="w-full h-20 object-cover rounded mb-2"
                  />
                  <p className="text-sm font-medium truncate">{source.name}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowSourceSelector(false)}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Desktop Recording Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valorant Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Circle 
              className={`h-3 w-3 ${isValorantRunning ? 'text-green-500 fill-current' : 'text-red-500'}`} 
            />
            <span className="font-medium">Valorant Status</span>
          </div>
          <Badge variant={isValorantRunning ? "default" : "secondary"}>
            {isValorantRunning ? 'Running' : 'Not Running'}
          </Badge>
        </div>

        <Separator />

        {/* Recording Status */}
        {recordingState.isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recording Status</span>
              <Badge variant="destructive" className="animate-pulse">
                ● Recording
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Duration</span>
              <span className="text-sm font-mono">
                {formatDuration(recordingState.duration)}
              </span>
            </div>
            {recordingState.source && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Source</span>
                <span className="text-sm truncate max-w-40">
                  {recordingState.source.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-2">
          {!recordingState.isRecording ? (
            <>
              <Button 
                onClick={handleAutoRecord}
                className="w-full"
                disabled={!isValorantRunning}
              >
                <Play className="h-4 w-4 mr-2" />
                Auto-Record Valorant
              </Button>
              <Button 
                variant="outline"
                onClick={handleStartRecording}
                className="w-full"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Select Screen/Window
              </Button>
            </>
          ) : (
            <Button 
              variant="destructive"
              onClick={stopRecording}
              className="w-full"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• App runs in system tray when minimized</p>
          <p>• Right-click tray icon for quick controls</p>
          <p>• Auto-recording starts 5s after Valorant launch</p>
        </div>

        {/* Desktop Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.electronAPI && console.log('Settings clicked')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.close()}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};