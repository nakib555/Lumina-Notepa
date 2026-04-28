import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onAudioRecorded: (base64Audio: string, duration: number, mimeType: string) => void;
}

export const VoiceRecorderButton = ({ onAudioRecorded }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'NotFoundError') {
        console.warn('Microphone not found. Audio recording will be unavailable.');
      } else {
        console.error('Microphone permission check failed:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Only check if we are in a browser environment that supports it
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      checkPermissions();
    }
  }, [checkPermissions]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        toast.error("Audio recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/aac' });
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Extract just the base64 part, skipping the data:audio/xxx;base64, prefix
          const base64Audio = base64data.split(',')[1];
          if (base64Audio && recordingDuration > 0) {
            onAudioRecorded(base64Audio, recordingDuration, audioBlob.type || 'audio/aac');
            toast.success("Voice memo saved");
          } else {
             toast.error("Failed to save recording or recording was too short");
          }
        };

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (e: unknown) {
      const err = e as Error;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error("Microphone permission denied");
      } else if (err.name === 'NotFoundError') {
        toast.error("No microphone found on this device");
      } else {
        toast.error("Failed to start recording: " + (err?.message || 'Unknown error'));
      }
      console.error(e);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (e: unknown) {
      const err = e as Error;
      toast.error("Failed to stop recording: " + (err?.message || 'Unknown error'));
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
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

