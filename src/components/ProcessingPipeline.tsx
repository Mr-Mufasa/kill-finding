import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Loader2, Video, Brain, Scissors, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

interface ProcessingPipelineProps {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  estimatedTime?: number;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  isProcessing,
  currentStep,
  progress,
  estimatedTime
}) => {
  const steps: ProcessingStep[] = [
    {
      id: 'upload',
      label: 'Video Upload',
      description: 'Analyzing video file and extracting metadata',
      icon: <Video className="w-5 h-5" />,
      status: currentStep === 'upload' ? 'processing' : progress > 0 ? 'completed' : 'pending'
    },
    {
      id: 'analysis',
      label: 'AI Analysis',
      description: 'Detecting kills using computer vision and audio analysis',
      icon: <Brain className="w-5 h-5" />,
      status: currentStep === 'analysis' ? 'processing' : 
              currentStep === 'upload' ? 'pending' : 
              progress > 25 ? 'completed' : 'pending'
    },
    {
      id: 'extraction',
      label: 'Clip Extraction',
      description: 'Extracting kill moments and creating highlights',
      icon: <Scissors className="w-5 h-5" />,
      status: currentStep === 'extraction' ? 'processing' : 
              ['upload', 'analysis'].includes(currentStep) ? 'pending' : 
              progress > 75 ? 'completed' : 'pending'
    },
    {
      id: 'export',
      label: 'Export Ready',
      description: 'Processing complete, clips ready for download',
      icon: <Download className="w-5 h-5" />,
      status: progress === 100 ? 'completed' : 'pending'
    }
  ];

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-accent animate-spin" />;
      case 'error':
        return <Circle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (!isProcessing && progress === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-dark border-border shadow-card">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Processing Pipeline</h3>
            {isProcessing && (
              <Badge variant="secondary" className="bg-gradient-accent animate-pulse">
                Processing
              </Badge>
            )}
          </div>
          {estimatedTime && isProcessing && (
            <div className="text-sm text-muted-foreground">
              Est. {Math.ceil(estimatedTime / 60)} min remaining
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm text-accent">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                step.status === 'completed' && "bg-success/10 border border-success/20",
                step.status === 'processing' && "bg-accent/10 border border-accent/20 shadow-glow-secondary",
                step.status === 'pending' && "bg-muted/30",
                step.status === 'error' && "bg-destructive/10 border border-destructive/20"
              )}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {step.label}
                  </h4>
                  {step.status === 'processing' && (
                    <Badge variant="outline" className="text-xs border-accent text-accent">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className={cn(
                  "w-px h-8 absolute left-[2.125rem] translate-y-16",
                  step.status === 'completed' ? "bg-success/40" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};