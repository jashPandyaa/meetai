// components/VoiceHandler.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface ConversationItem {
  user: string;
  assistant: string;
  timestamp: Date;
}

interface VoiceHandlerProps {
  isCallActive: boolean;
  onTranscript?: (transcript: string) => void;
  onResponse?: (response: string) => void;
}

export default function VoiceHandler({ isCallActive, onTranscript, onResponse }: VoiceHandlerProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [error, setError] = useState<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        if (recognitionRef.current) {
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognitionRef.current.onresult = (event: any) => {
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }

            if (finalTranscript) {
              setTranscript(finalTranscript);
              handleUserSpeech(finalTranscript);
            }
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError('Speech recognition error: ' + event.error);
            setIsListening(false);
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };
        }
      }

      // Initialize Speech Synthesis
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleUserSpeech = async (userMessage: string): Promise<void> => {
    try {
      setError('');
      
      // Call your API route
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: `This is during a video call meeting`,
          conversationHistory: conversationHistory
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiResponse: string = data.response;
        
        // Update conversation history
        const newHistory: ConversationItem[] = [
          ...conversationHistory,
          { user: userMessage, assistant: aiResponse, timestamp: new Date() }
        ].slice(-10); // Keep only last 10 exchanges
        
        setConversationHistory(newHistory);
        
        // Speak the response
        speakResponse(aiResponse);
        
        // Callback to parent component
        onResponse?.(aiResponse);
        onTranscript?.(userMessage);
        
      } else {
        setError('Failed to get AI response');
        speakResponse("I'm sorry, I couldn't process that. Could you try again?");
      }
      
    } catch (error) {
      console.error('Error processing speech:', error);
      setError('Error processing your message');
      speakResponse("I'm having trouble right now. Can you repeat that?");
    }
  };

  const speakResponse = (text: string): void => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (error) => {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const toggleListening = (): void => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopSpeaking = (): void => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isCallActive) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={toggleListening}
          className={`p-2 rounded-full ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isSpeaking}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        
        <button
          onClick={stopSpeaking}
          className={`p-2 rounded-full ${
            isSpeaking 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-300 text-gray-500'
          }`}
          disabled={!isSpeaking}
        >
          {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        
        <div className="flex-1 text-sm">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'} inline-block mr-2`}></div>
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Click mic to talk'}
        </div>
      </div>
      
      {transcript && (
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          <strong>You:</strong> {transcript}
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500 mb-2">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Powered by Gemini AI + Web Speech API
      </div>
    </div>
  );
}

