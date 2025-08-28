// // components/VoiceHandler.tsx
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

// interface ConversationItem {
//   user: string;
//   assistant: string;
//   timestamp: Date;
// }

// interface VoiceHandlerProps {
//   isCallActive: boolean;
//   onTranscript?: (transcript: string) => void;
//   onResponse?: (response: string) => void;
// }

// export default function VoiceHandler({ isCallActive, onTranscript, onResponse }: VoiceHandlerProps) {
//   const [isListening, setIsListening] = useState<boolean>(false);
//   const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
//   const [transcript, setTranscript] = useState<string>('');
//   const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
//   const [error, setError] = useState<string>('');

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const recognitionRef = useRef<any>(null);
//   const synthRef = useRef<SpeechSynthesis | null>(null);

//   // Initialize Speech Recognition
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
//       if (SpeechRecognition) {
//         recognitionRef.current = new SpeechRecognition();
//         if (recognitionRef.current) {
//           recognitionRef.current.continuous = true;
//           recognitionRef.current.interimResults = true;
//           recognitionRef.current.lang = 'en-US';

//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           recognitionRef.current.onresult = (event: any) => {
//             let finalTranscript = '';
            
//             for (let i = event.resultIndex; i < event.results.length; i++) {
//               if (event.results[i].isFinal) {
//                 finalTranscript += event.results[i][0].transcript;
//               }
//             }

//             if (finalTranscript) {
//               setTranscript(finalTranscript);
//               handleUserSpeech(finalTranscript);
//             }
//           };

//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           recognitionRef.current.onerror = (event: any) => {
//             console.error('Speech recognition error:', event.error);
//             setError('Speech recognition error: ' + event.error);
//             setIsListening(false);
//           };

//           recognitionRef.current.onend = () => {
//             setIsListening(false);
//           };
//         }
//       }

//       // Initialize Speech Synthesis
//       synthRef.current = window.speechSynthesis;
//     }

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//       if (synthRef.current) {
//         synthRef.current.cancel();
//       }
//     };
//   }, []);

//   const handleUserSpeech = async (userMessage: string): Promise<void> => {
//     try {
//       setError('');
      
//       // Call your API route
//       const response = await fetch('/api/ai-response', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message: userMessage,
//           context: `This is during a video call meeting`,
//           conversationHistory: conversationHistory
//         }),
//       });

//       const data = await response.json();
      
//       if (data.success) {
//         const aiResponse: string = data.response;
        
//         // Update conversation history
//         const newHistory: ConversationItem[] = [
//           ...conversationHistory,
//           { user: userMessage, assistant: aiResponse, timestamp: new Date() }
//         ].slice(-10); // Keep only last 10 exchanges
        
//         setConversationHistory(newHistory);
        
//         // Speak the response
//         speakResponse(aiResponse);
        
//         // Callback to parent component
//         onResponse?.(aiResponse);
//         onTranscript?.(userMessage);
        
//       } else {
//         setError('Failed to get AI response');
//         speakResponse("I'm sorry, I couldn't process that. Could you try again?");
//       }
      
//     } catch (error) {
//       console.error('Error processing speech:', error);
//       setError('Error processing your message');
//       speakResponse("I'm having trouble right now. Can you repeat that?");
//     }
//   };

//   const speakResponse = (text: string): void => {
//     if (!synthRef.current || !text) return;

//     // Cancel any ongoing speech
//     synthRef.current.cancel();
    
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 0.9;
//     utterance.pitch = 1;
//     utterance.volume = 0.8;
    
//     utterance.onstart = () => {
//       setIsSpeaking(true);
//     };
    
//     utterance.onend = () => {
//       setIsSpeaking(false);
//     };
    
//     utterance.onerror = (error) => {
//       console.error('TTS error:', error);
//       setIsSpeaking(false);
//     };

//     synthRef.current.speak(utterance);
//   };

//   const toggleListening = (): void => {
//     if (!recognitionRef.current) {
//       setError('Speech recognition not supported in this browser');
//       return;
//     }

//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     } else {
//       setTranscript('');
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

//   const stopSpeaking = (): void => {
//     if (synthRef.current) {
//       synthRef.current.cancel();
//       setIsSpeaking(false);
//     }
//   };

//   if (!isCallActive) {
//     return null;
//   }

//   return (
//     <div className="fixed top-2 right-2 
//                     md:top-auto md:right-auto md:bottom-4 md:right-4 
//                     bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border max-w-[180px]
//                     md:max-w-sm md:p-4 z-50">
//       <div className="flex items-center gap-1 mb-1">
//         <button
//           onClick={toggleListening}
//           className={`p-1 rounded-full md:p-2 ${
//             isListening 
//               ? 'bg-red-500 text-white animate-pulse' 
//               : 'bg-blue-500 text-white hover:bg-blue-600'
//           }`}
//           disabled={isSpeaking}
//         >
//           {isListening ? <Mic className="w-3 h-3 md:w-4 md:h-4" /> : <MicOff className="w-3 h-3 md:w-4 md:h-4" />}
//         </button>
        
//         <button
//           onClick={stopSpeaking}
//           className={`p-1 rounded-full md:p-2 ${
//             isSpeaking 
//               ? 'bg-orange-500 text-white' 
//               : 'bg-gray-300 text-gray-500'
//           }`}
//           disabled={!isSpeaking}
//         >
//           {isSpeaking ? <Volume2 className="w-3 h-3 md:w-4 md:h-4" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
//         </button>
        
//         <div className="flex-1 text-[10px] md:text-sm">
//           <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'} inline-block mr-1 md:mr-2`}></div>
//           {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Click mic'}
//         </div>
//       </div>
      
//       {transcript && (
//         <div className="text-[10px] text-gray-600 dark:text-gray-300 mb-1 md:text-sm md:mb-2">
//           <strong>You:</strong> {transcript}
//         </div>
//       )}
      
//       {error && (
//         <div className="text-[10px] text-red-500 mb-1 md:text-sm md:mb-2">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// }

// components/VoiceHandler.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, RefreshCw } from 'lucide-react';

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

// Define types for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceHandler({ isCallActive, onTranscript, onResponse }: VoiceHandlerProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [ttsStatus, setTtsStatus] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ttsRetryCountRef = useRef<number>(0);

  // Check if mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobileCheck);
      console.log('Mobile device detected:', mobileCheck);
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    // Mobile-optimized settings
    recognition.continuous = false; // Changed to false for better mobile compatibility
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        finalTranscript = lastResult[0].transcript;
        
        if (finalTranscript.trim()) {
          console.log('Speech recognized:', finalTranscript);
          setTranscript(finalTranscript);
          setIsListening(false);
          handleUserSpeech(finalTranscript);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Initialize Speech Synthesis with mobile-specific handling
    synthRef.current = window.speechSynthesis;
    
    // Load voices when they become available (important for mobile)
    const loadVoices = () => {
      console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
    };
    
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial load

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleUserSpeech = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    setIsProcessing(true);
    setError('');
    setTtsStatus('');
    
    try {
      // Set timeout for API call (15 seconds)
      const controller = new AbortController();
      apiTimeoutRef.current = setTimeout(() => controller.abort(), 15000);
      
      console.log('Sending request to API:', userMessage);
      
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: `This is during a video call meeting`,
          conversationHistory: conversationHistory.slice(-3)
        }),
        signal: controller.signal
      });

      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
        apiTimeoutRef.current = null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response received:', data);
      
      if (data.success && data.response) {
        const aiResponse = data.response;
        
        // Update conversation history
        const newHistory: ConversationItem[] = [
          ...conversationHistory,
          { user: userMessage, assistant: aiResponse, timestamp: new Date() }
        ].slice(-10);
        
        setConversationHistory(newHistory);
        
        // Callback to parent component
        onTranscript?.(userMessage);
        onResponse?.(aiResponse);
        
        // Speak the response with mobile-specific handling
        speakResponse(aiResponse);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
      
    } catch (error: unknown) {
      console.error('Error processing speech:', error);
      
      // let errorMessage = 'Error processing your request';
      // let fallbackResponse = "I'm having trouble right now. Please try again.";
      
      // // if (error instanceof Error) {
      // //   if (error.name === 'AbortError') {
      // //     errorMessage = 'Request timeout. Please check your connection.';
      // //     fallbackResponse = "I'm taking too long to respond. Please try again.";
      // //   } else if (error.message.includes('Failed to fetch')) {
      // //     errorMessage = 'Network connection error. Please check your internet.';
      // //     fallbackResponse = "I can't connect right now. Please check your internet.";
      // //   }
      // // }
      
      // setError(errorMessage);
      // Don't try to speak on error to avoid compounding issues
    } finally {
      setIsProcessing(false);
    }
  }, [conversationHistory, onTranscript, onResponse]);

  // Mobile-specific TTS solution
  const speakResponse = useCallback((text: string) => {
    if (!text) return;
    
    console.log('Attempting to speak:', text);
    setTtsStatus('Preparing speech...');
    
    if (!synthRef.current) {
      console.error('Speech synthesis not available');
      setTtsStatus('Speech synthesis not available');
      return;
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    setIsSpeaking(false);
    ttsRetryCountRef.current = 0;
    
    // Use a timeout to handle mobile TTS initialization
    const ttsTimeout = setTimeout(() => {
      executeTts(text);
    }, isMobile ? 500 : 100);
    
    return () => clearTimeout(ttsTimeout);
  }, [isMobile]);

  const executeTts = (text: string) => {
    if (!synthRef.current) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Mobile-optimized settings
    utterance.rate = isMobile ? 0.9 : 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Select appropriate voice (critical for mobile)
    const voices = synthRef.current.getVoices();
    console.log('Available voices:', voices.length);
    
    if (voices.length > 0) {
      // Prefer voices that work well on mobile
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (isMobile ? voice.localService : true)
      ) || voices[0];
      
      console.log('Selected voice:', preferredVoice.name);
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      console.log('TTS started');
      setIsSpeaking(true);
      setTtsStatus('Speaking...');
      ttsRetryCountRef.current = 0;
    };
    
    utterance.onend = () => {
      console.log('TTS ended');
      setIsSpeaking(false);
      setTtsStatus('');
    };
    
    utterance.onerror = (event) => {
      console.error('TTS error:', event);
      setIsSpeaking(false);
      setTtsStatus(`TTS error: ${event.error}`);
      
      // Retry logic for mobile
      if (isMobile && ttsRetryCountRef.current < 2) {
        ttsRetryCountRef.current += 1;
        console.log(`Retrying TTS (attempt ${ttsRetryCountRef.current})`);
        setTimeout(() => {
          if (synthRef.current) {
            synthRef.current.speak(utterance);
          }
        }, 300);
      }
    };
    
    // Special handling for iOS
    if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS requires user interaction for audio, so we try to work around it
      document.body.addEventListener('touchstart', () => {
        if (synthRef.current && !isSpeaking) {
          synthRef.current.speak(utterance);
        }
      }, { once: true });
    }
    
    try {
      synthRef.current.speak(utterance);
      setTtsStatus('Speech started...');
    } catch (err) {
      console.error('Failed to start TTS:', err);
      setTtsStatus('Failed to start speech');
      
      // Fallback: show text response if TTS fails
      if (onResponse) {
        onResponse(text);
      }
    }
  };

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setError('');
      setTtsStatus('');
      
      // Stop any ongoing speech before starting recognition
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start microphone. Please check permissions.');
      }
    }
  }, [isListening]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setTtsStatus('');
    }
  }, []);

  const retryLastRequest = useCallback(() => {
    if (transcript) {
      handleUserSpeech(transcript);
    }
  }, [transcript, handleUserSpeech]);

  if (!isCallActive) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 
                    md:top-auto md:right-auto md:bottom-4 md:right-4 
                    bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border max-w-[200px]
                    md:max-w-sm md:p-4 z-50">
      <div className="flex items-center gap-1 mb-1">
        <button
          onClick={toggleListening}
          className={`p-1 rounded-full md:p-2 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : isProcessing
                ? 'bg-orange-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isSpeaking || isProcessing}
          style={{ touchAction: 'manipulation' }}
        >
          {isProcessing ? (
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
          ) : isListening ? (
            <Mic className="w-3 h-3 md:w-4 md:h-4" />
          ) : (
            <MicOff className="w-3 h-3 md:w-4 md:h-4" />
          )}
        </button>
        
        <button
          onClick={stopSpeaking}
          className={`p-1 rounded-full md:p-2 ${
            isSpeaking 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-300'
          }`}
          disabled={!isSpeaking}
          style={{ touchAction: 'manipulation' }}
        >
          {isSpeaking ? <Volume2 className="w-3 h-3 md:w-4 md:h-4" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        <div className="flex-1 text-[10px] md:text-sm ml-1">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
            isListening ? 'bg-red-500' : 
            isProcessing ? 'bg-orange-500' : 
            isSpeaking ? 'bg-green-500' : 'bg-gray-300'
          } inline-block mr-1 md:mr-2`}></div>
          {isListening ? 'Listening...' : 
           isProcessing ? 'Processing...' : 
           isSpeaking ? 'Speaking...' : 'Click mic'}
        </div>
      </div>
      
      {transcript && (
        <div className="text-[10px] text-gray-600 dark:text-gray-300 mb-1 md:text-sm md:mb-2">
          <strong>You:</strong> {transcript}
        </div>
      )}
      
      {ttsStatus && (
        <div className="text-[8px] text-blue-500 mb-1 md:text-xs">
          {ttsStatus}
        </div>
      )}
      
      {error && (
        <div className="text-[10px] text-red-500 mb-1 md:text-sm md:mb-2 flex items-center justify-between">
          <span>{error}</span>
          {transcript && (
            <button 
              onClick={retryLastRequest}
              className="text-blue-500 ml-2"
              title="Retry"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      
      {isMobile && (
        <div className="text-[8px] text-gray-500 mt-1 md:text-xs">
          Mobile mode: Tap mic to start/stop
        </div>
      )}
    </div>
  );
}