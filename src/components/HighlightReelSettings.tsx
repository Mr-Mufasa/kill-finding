import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { HighlightReelSettings } from '@/lib/ai/videoCompiler';
import { Video, Download } from 'lucide-react';

interface HighlightReelSettingsProps {
  onGenerateReel: (settings: HighlightReelSettings) => void;
  isGenerating: boolean;
  clipCount: number;
}

export const HighlightReelSettingsComponent = ({ 
  onGenerateReel, 
  isGenerating, 
  clipCount 
}: HighlightReelSettingsProps) => {
  const [settings, setSettings] = useState<HighlightReelSettings>({
    transitionDuration: 0.5,
    orderBy: 'chronological',
    includeIntro: true,
    includeOutro: true,
    fadeTransitions: true
  });

  const handleGenerateReel = () => {
    onGenerateReel(settings);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Highlight Reel Settings
        </CardTitle>
        <CardDescription>
          Create one continuous video with all {clipCount} detected kills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Clip Order</Label>
          <Select 
            value={settings.orderBy} 
            onValueChange={(value: 'chronological' | 'confidence') => 
              setSettings(prev => ({ ...prev, orderBy: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chronological">Chronological (Time Order)</SelectItem>
              <SelectItem value="confidence">Best Kills First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Transition Duration: {settings.transitionDuration}s</Label>
          <Slider
            value={[settings.transitionDuration]}
            onValueChange={([value]) => 
              setSettings(prev => ({ ...prev, transitionDuration: value }))
            }
            min={0}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="intro"
              checked={settings.includeIntro}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, includeIntro: checked }))
              }
            />
            <Label htmlFor="intro">Include Intro</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="outro"
              checked={settings.includeOutro}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, includeOutro: checked }))
              }
            />
            <Label htmlFor="outro">Include Outro</Label>
          </div>

          <div className="flex items-center space-x-2 col-span-2">
            <Switch
              id="transitions"
              checked={settings.fadeTransitions}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, fadeTransitions: checked }))
              }
            />
            <Label htmlFor="transitions">Smooth Transitions</Label>
          </div>
        </div>

        <Button 
          onClick={handleGenerateReel}
          disabled={isGenerating || clipCount === 0}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating Highlight Reel...' : 'Generate Highlight Reel'}
        </Button>
      </CardContent>
    </Card>
  );
};