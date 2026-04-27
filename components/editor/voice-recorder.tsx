import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onAudioRecorded: (base64Audio: string, duration: number, mimeType: string) => void;
}

export const VoiceRecorderButton = ({ onAudioRecorded }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await VoiceRecorder.hasAudioRecordingPermission();
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const startRecording = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const hasPerm = await VoiceRecorder.hasAudioRecordingPermission();
        if (!hasPerm.value) {
          const req = await VoiceRecorder.requestAudioRecordingPermission();
          if (!req.value) {
            toast.error("Microphone permission denied");
            return;
          }
        }
        await VoiceRecorder.startRecording();
      } else {
         const hasPerm = await VoiceRecorder.hasAudioRecordingPermission();
         if (!hasPerm.value) {
            const req = await VoiceRecorder.requestAudioRecordingPermission();
            if (!req.value) {
                toast.error("Microphone permission denied");
                return;
            }
         }
         await VoiceRecorder.startRecording();
      }
      
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Failed to start recording: " + (err?.message || 'Unknown error'));
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await VoiceRecorder.stopRecording();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (result && result.value && result.value.recordDataBase64) {
        onAudioRecorded(
         result.value.recordDataBase64, 
         recordingDuration, 
         result.value.msDuration ? result.value.mimeType : 'audio/aac'
        );
        toast.success("Voice memo saved");
      } else {
        toast.error("Failed to save recording");
      }
      setRecordingDuration(0);
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Failed to stop recording: " + (err?.message || 'Unknown error'));
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingDuration(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={startRecording}
          className="h-8 gap-2 rounded-full text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-medium text-[11px]"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Record Memo</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-destructive/10 rounded-full pl-3 pr-1 py-1 border border-destructive/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mr-2">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-[11px] font-bold text-destructive font-mono w-10">
                {formatTime(recordingDuration)}
                </span>
            </div>
            <Button 
                variant="destructive" 
                size="icon" 
                onClick={stopRecording}
                className="h-6 w-6 rounded-full shadow-sm"
            >
                <Square className="w-3 h-3 fill-current" />
            </Button>
        </div>
      )}
    </div>
  );
};
