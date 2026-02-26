import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function VoiceNote({ onTranscript, className = '' }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript && onTranscript) {
        onTranscript(transcript, event.results[event.results.length - 1].isFinal);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onTranscript]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
        listening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-100 text-gray-600 active:bg-gray-200'
      } ${className}`}
      title={listening ? 'Stop recording' : 'Voice to text'}
    >
      {listening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
