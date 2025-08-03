import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Monitor, 
  Gamepad2, 
  Zap,
  Shield,
  Bell,
  Terminal
} from 'lucide-react';

export const DownloadDesktopApp = () => {
  const handleDownloadInstructions = () => {
    const instructions = `
# Download Valorant Kill Extractor Desktop App

## Prerequisites
- Node.js (version 16 or higher)
- Git

## Installation Steps

1. Clone or download the project:
   git clone [your-repo-url]
   cd valorant-kill-extractor

2. Install dependencies:
   npm install

3. Build the desktop application:
   npm run build:electron

4. The built application will be in the 'dist' folder:
   - Windows: dist/win-unpacked/Valorant Kill Extractor.exe
   - Mac: dist/mac/Valorant Kill Extractor.app
   - Linux: dist/linux-unpacked/

## Running in Development Mode
npm run dev:electron

## Features
✅ Automatic Valorant detection
✅ Background recording
✅ System tray integration
✅ Auto-start recording when Valorant launches
✅ Global hotkeys
✅ Native file saving
`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'valorant-kill-extractor-setup.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Desktop Application
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Web Version
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Manual video upload</li>
              <li>• Browser-based recording</li>
              <li>• Limited file access</li>
              <li>• No background operation</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Desktop App
              <Badge variant="default" className="ml-2">Recommended</Badge>
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Auto Valorant detection
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                Background operation
              </li>
              <li className="flex items-center gap-2">
                <Bell className="h-3 w-3" />
                System tray integration
              </li>
              <li className="flex items-center gap-2">
                <Monitor className="h-3 w-3" />
                Native screen recording
              </li>
            </ul>
          </div>
        </div>

        <Separator />

        {/* Download Instructions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Quick Setup</h3>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Terminal className="h-4 w-4" />
              <code className="bg-background px-2 py-1 rounded">npm install</code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Terminal className="h-4 w-4" />
              <code className="bg-background px-2 py-1 rounded">npm run build:electron</code>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            The built app will be in the <code className="bg-muted px-1 rounded">dist</code> folder
          </p>
        </div>

        {/* Download Button */}
        <Button 
          onClick={handleDownloadInstructions}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Setup Instructions
        </Button>

        {/* System Requirements */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Requirements:</strong> Node.js 16+, Windows 10+/macOS 10.14+/Ubuntu 18+</p>
          <p><strong>Size:</strong> ~150MB after build</p>
          <p><strong>Permissions:</strong> Screen recording access required</p>
        </div>
      </CardContent>
    </Card>
  );
};