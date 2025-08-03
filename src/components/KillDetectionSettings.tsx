import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Volume2, Eye, Brain } from 'lucide-react';

interface KillDetectionSettingsProps {
  settings: {
    audioDetection: boolean;
    visualDetection: boolean;
    killFeedDetection: boolean;
    sensitivity: number;
    clipDuration: number;
    preKillBuffer: number;
  };
  onChange: (settings: any) => void;
  onStartProcessing: () => void;
  disabled?: boolean;
}

export const KillDetectionSettings: React.FC<KillDetectionSettingsProps> = ({
  settings,
  onChange,
  onStartProcessing,
  disabled = false
}) => {
  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Card className="p-6 bg-gradient-dark border-border shadow-card">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">AI Detection Settings</h3>
          <Badge variant="secondary" className="bg-gradient-accent">
            <Brain className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>

        <div className="grid gap-6">
          {/* Detection Methods */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Detection Methods</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-accent" />
                  <div>
                    <Label className="text-sm font-medium">Audio Detection</Label>
                    <p className="text-xs text-muted-foreground">Detect kill sounds and audio cues</p>
                  </div>
                </div>
                <Switch
                  checked={settings.audioDetection}
                  onCheckedChange={(value) => updateSetting('audioDetection', value)}
                  disabled={disabled}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-accent" />
                  <div>
                    <Label className="text-sm font-medium">Visual Detection</Label>
                    <p className="text-xs text-muted-foreground">Analyze crosshair placement and enemy elimination</p>
                  </div>
                </div>
                <Switch
                  checked={settings.visualDetection}
                  onCheckedChange={(value) => updateSetting('visualDetection', value)}
                  disabled={disabled}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-accent" />
                  <div>
                    <Label className="text-sm font-medium">Kill Feed Detection</Label>
                    <p className="text-xs text-muted-foreground">OCR analysis of kill notifications</p>
                  </div>
                </div>
                <Switch
                  checked={settings.killFeedDetection}
                  onCheckedChange={(value) => updateSetting('killFeedDetection', value)}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

          {/* Sensitivity Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Detection Sensitivity</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm">Sensitivity</Label>
                <span className="text-xs text-muted-foreground">{settings.sensitivity}%</span>
              </div>
              <Slider
                value={[settings.sensitivity]}
                onValueChange={(value) => updateSetting('sensitivity', value[0])}
                max={100}
                min={10}
                step={5}
                disabled={disabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          {/* Clip Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Clip Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Clip Duration</Label>
                  <span className="text-xs text-muted-foreground">{settings.clipDuration}s</span>
                </div>
                <Slider
                  value={[settings.clipDuration]}
                  onValueChange={(value) => updateSetting('clipDuration', value[0])}
                  max={30}
                  min={5}
                  step={1}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Pre-Kill Buffer</Label>
                  <span className="text-xs text-muted-foreground">{settings.preKillBuffer}s</span>
                </div>
                <Slider
                  value={[settings.preKillBuffer]}
                  onValueChange={(value) => updateSetting('preKillBuffer', value[0])}
                  max={10}
                  min={1}
                  step={0.5}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

          {/* Start Processing Button */}
          <Button
            variant="hero"
            size="hero"
            onClick={onStartProcessing}
            disabled={disabled || (!settings.audioDetection && !settings.visualDetection && !settings.killFeedDetection)}
            className="w-full"
          >
            <Brain className="w-5 h-5 mr-2" />
            Start AI Kill Detection
          </Button>
        </div>
      </div>
    </Card>
  );
};