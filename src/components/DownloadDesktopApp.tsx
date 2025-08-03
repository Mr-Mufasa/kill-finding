import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { 
  Download, 
  Monitor, 
  Gamepad2, 
  Zap,
  Shield,
  Bell,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import valorantHero from '@/assets/valorant-hero.jpg';

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

export const DownloadDesktopApp = () => {
  const [latestRelease, setLatestRelease] = useState<GitHubRelease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    // Detect Windows
    setIsWindows(navigator.platform.toLowerCase().includes('win'));
    
    // Fetch latest release from GitHub
    fetchLatestRelease();
  }, []);

  const fetchLatestRelease = async () => {
    try {
      // Replace with your actual GitHub repo
      const response = await fetch('https://api.github.com/repos/your-username/your-repo/releases/latest');
      if (response.ok) {
        const release = await response.json();
        setLatestRelease(release);
      }
    } catch (error) {
      console.log('Could not fetch latest release');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (latestRelease) {
      const exeAsset = latestRelease.assets.find(asset => asset.name.endsWith('.exe'));
      if (exeAsset) {
        window.open(exeAsset.browser_download_url, '_blank');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Section with Valorant Image */}
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={valorantHero} 
          alt="Valorant Game" 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">Desktop Application</h2>
            <p className="text-lg opacity-90">Enhanced recording for Valorant players</p>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download for Windows
            {!isWindows && <Badge variant="outline">Windows Required</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download Status */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Checking for latest version...</p>
            </div>
          ) : latestRelease ? (
            <div className="space-y-4">
              {/* Latest Release Info */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Latest Version: {latestRelease.tag_name}</h3>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                </div>
                {latestRelease.assets.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(latestRelease.assets[0].size)} • Windows 10+ Required
                  </p>
                )}
              </div>

              {/* Download Button */}
              <Button 
                onClick={handleDownload}
                className="w-full"
                size="lg"
                disabled={!isWindows}
              >
                <Download className="h-4 w-4 mr-2" />
                {isWindows ? 'Download Valorant Kill Extractor.exe' : 'Windows Required'}
              </Button>

              {!isWindows && (
                <p className="text-sm text-muted-foreground text-center">
                  This application is designed specifically for Windows and Valorant.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  No pre-built releases available yet. You can build from source:
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('https://github.com/your-username/your-repo', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on GitHub
                </Button>
              </div>
            </div>
          )}

          <Separator />

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

          {/* System Requirements */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Requirements:</strong> Windows 10+, Valorant installed</p>
            <p><strong>Permissions:</strong> Screen recording access required</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};