import { pipeline } from '@huggingface/transformers';
import type { VideoFrame, AudioSegment } from './videoProcessor';
import type { KillClip } from '@/hooks/useKillDetection';

export interface DetectionResult {
  timestamp: number;
  confidence: number;
  type: 'visual' | 'audio' | 'killfeed';
  evidence: string;
}

export class KillDetector {
  private textRecognizer: any = null;
  private audioClassifier: any = null;
  private imageClassifier: any = null;

  async initialize() {
    try {
      // Initialize OCR for kill feed detection
      this.textRecognizer = await pipeline(
        'image-to-text',
        'Xenova/trocr-base-printed',
        { device: 'webgpu' }
      );

      // Initialize audio classification for kill sounds
      this.audioClassifier = await pipeline(
        'audio-classification',
        'MIT/ast-finetuned-audioset-10-10-0.4593',
        { device: 'webgpu' }
      );

      // Initialize image classification for visual indicators
      this.imageClassifier = await pipeline(
        'image-classification',
        'google/vit-base-patch16-224',
        { device: 'webgpu' }
      );

      console.log('AI models initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      // Fallback to CPU
      this.textRecognizer = await pipeline('image-to-text', 'Xenova/trocr-base-printed');
      this.audioClassifier = await pipeline('audio-classification', 'MIT/ast-finetuned-audioset-10-10-0.4593');
      this.imageClassifier = await pipeline('image-classification', 'google/vit-base-patch16-224');
    }
  }

  async detectKillsInFrames(frames: VideoFrame[]): Promise<DetectionResult[]> {
    const results: DetectionResult[] = [];

    for (const frame of frames) {
      try {
        // Extract kill feed region (top-right corner typically)
        const killFeedCanvas = this.extractKillFeedRegion(frame.canvas);
        
        // OCR on kill feed region
        const ocrResult = await this.textRecognizer(killFeedCanvas.toDataURL());
        
        if (this.isKillFeedText(ocrResult.generated_text)) {
          results.push({
            timestamp: frame.timestamp,
            confidence: 85,
            type: 'killfeed',
            evidence: ocrResult.generated_text
          });
        }

        // Check for visual kill indicators (crosshair changes, elimination text)
        const imageResult = await this.imageClassifier(frame.canvas.toDataURL());
        const killIndicators = this.analyzeImageForKillIndicators(imageResult);
        
        if (killIndicators.confidence > 70) {
          results.push({
            timestamp: frame.timestamp,
            confidence: killIndicators.confidence,
            type: 'visual',
            evidence: killIndicators.evidence
          });
        }

      } catch (error) {
        console.error('Error processing frame:', error);
      }
    }

    return results;
  }

  async detectKillsInAudio(audioSegments: AudioSegment[]): Promise<DetectionResult[]> {
    const results: DetectionResult[] = [];

    for (const segment of audioSegments) {
      try {
        const audioResult = await this.audioClassifier(segment.data);
        
        if (this.isKillSound(audioResult)) {
          results.push({
            timestamp: segment.timestamp,
            confidence: this.getAudioConfidence(audioResult),
            type: 'audio',
            evidence: audioResult[0]?.label || 'Unknown kill sound'
          });
        }
      } catch (error) {
        console.error('Error processing audio segment:', error);
      }
    }

    return results;
  }

  private extractKillFeedRegion(canvas: HTMLCanvasElement): HTMLCanvasElement {
    // Extract top-right region where kill feed typically appears in Valorant
    const regionCanvas = document.createElement('canvas');
    const ctx = regionCanvas.getContext('2d')!;
    
    const regionWidth = Math.floor(canvas.width * 0.3); // 30% of width
    const regionHeight = Math.floor(canvas.height * 0.4); // 40% of height
    const startX = canvas.width - regionWidth;
    const startY = 0;
    
    regionCanvas.width = regionWidth;
    regionCanvas.height = regionHeight;
    
    ctx.drawImage(
      canvas,
      startX, startY, regionWidth, regionHeight,
      0, 0, regionWidth, regionHeight
    );
    
    return regionCanvas;
  }

  private isKillFeedText(text: string): boolean {
    const killIndicators = [
      'eliminated',
      'killed',
      'headshot',
      'you killed',
      'you eliminated',
      'vandal',
      'phantom',
      'operator',
      'sheriff',
      'spectre'
    ];
    
    const lowercaseText = text.toLowerCase();
    return killIndicators.some(indicator => lowercaseText.includes(indicator));
  }

  private analyzeImageForKillIndicators(imageResult: any): { confidence: number; evidence: string } {
    // Look for game-specific visual indicators
    const killRelatedLabels = [
      'crosshair',
      'elimination',
      'target',
      'scope',
      'weapon'
    ];
    
    let maxConfidence = 0;
    let evidence = '';
    
    for (const result of imageResult) {
      const isKillRelated = killRelatedLabels.some(label => 
        result.label.toLowerCase().includes(label)
      );
      
      if (isKillRelated && result.score > maxConfidence) {
        maxConfidence = result.score * 100;
        evidence = result.label;
      }
    }
    
    return { confidence: maxConfidence, evidence };
  }

  private isKillSound(audioResult: any): boolean {
    const killSounds = [
      'gunshot',
      'explosion',
      'weapon',
      'shot',
      'fire',
      'bang'
    ];
    
    if (!audioResult || !audioResult[0]) return false;
    
    const topLabel = audioResult[0].label.toLowerCase();
    return killSounds.some(sound => topLabel.includes(sound)) && audioResult[0].score > 0.6;
  }

  private getAudioConfidence(audioResult: any): number {
    return audioResult && audioResult[0] ? Math.round(audioResult[0].score * 100) : 0;
  }

  combineDetections(
    visualResults: DetectionResult[],
    audioResults: DetectionResult[],
    settings: any
  ): KillClip[] {
    const allDetections = [...visualResults, ...audioResults];
    const clips: KillClip[] = [];
    
    // Group detections by proximity (within 2 seconds)
    const groupedDetections = this.groupNearbyDetections(allDetections, 2);
    
    groupedDetections.forEach((group, index) => {
      const avgTimestamp = group.reduce((sum, d) => sum + d.timestamp, 0) / group.length;
      const maxConfidence = Math.max(...group.map(d => d.confidence));
      const types = [...new Set(group.map(d => d.type))];
      
      // Apply sensitivity filter
      if (maxConfidence >= (100 - settings.sensitivity)) {
        clips.push({
          id: `clip-${index + 1}`,
          timestamp: Math.max(0, avgTimestamp - settings.preKillBuffer),
          duration: settings.clipDuration,
          confidence: maxConfidence,
          weapon: this.extractWeapon(group),
          enemiesKilled: this.estimateKillCount(group),
          isMultiKill: this.estimateKillCount(group) > 1
        });
      }
    });
    
    return clips;
  }

  private groupNearbyDetections(detections: DetectionResult[], threshold: number): DetectionResult[][] {
    const sorted = detections.sort((a, b) => a.timestamp - b.timestamp);
    const groups: DetectionResult[][] = [];
    let currentGroup: DetectionResult[] = [];
    
    for (const detection of sorted) {
      if (currentGroup.length === 0 || detection.timestamp - currentGroup[currentGroup.length - 1].timestamp <= threshold) {
        currentGroup.push(detection);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [detection];
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }

  private extractWeapon(detections: DetectionResult[]): string {
    const weapons = ['vandal', 'phantom', 'operator', 'sheriff', 'spectre', 'odin'];
    
    for (const detection of detections) {
      const evidence = detection.evidence.toLowerCase();
      for (const weapon of weapons) {
        if (evidence.includes(weapon)) {
          return weapon.charAt(0).toUpperCase() + weapon.slice(1);
        }
      }
    }
    
    return 'Unknown';
  }

  private estimateKillCount(detections: DetectionResult[]): number {
    // Simple heuristic: more detections within a short time = more kills
    const killFeedDetections = detections.filter(d => d.type === 'killfeed');
    return Math.max(1, killFeedDetections.length);
  }
}