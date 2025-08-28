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
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition with mobile compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition();
          if (recognitionRef.current) {
            // Mobile-optimized settings
            recognitionRef.current.continuous = false; // Changed from true for mobile
            recognitionRef.current.interimResults = false; // Changed from true for mobile
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.maxAlternatives = 1;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
              let finalTranscript = '';
              
              for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal || !recognitionRef.current.interimResults) {
                  finalTranscript += event.results[i][0].transcript;
                }
              }

              if (finalTranscript.trim()) {
                setTranscript(finalTranscript.trim());
                setIsListening(false);
                handleUserSpeech(finalTranscript.trim());
              }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onerror = (event: any) => {
              console.error('Speech recognition error:', event.error);
              let errorMessage = 'Speech recognition error: ' + event.error;
              
              // Handle specific mobile errors
              if (event.error === 'not-allowed') {
                errorMessage = 'Microphone permission denied. Please allow microphone access.';
              } else if (event.error === 'network') {
                errorMessage = 'Network error. Please check your connection.';
              } else if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Try speaking louder.';
              }
              
              setError(errorMessage);
              setIsListening(false);
            };

            recognitionRef.current.onstart = () => {
              console.log('Speech recognition started');
              setError('');
              
              // Add timeout for mobile (auto-stop after 10 seconds)
              timeoutRef.current = setTimeout(() => {
                if (recognitionRef.current && isListening) {
                  recognitionRef.current.stop();
                }
              }, 10000);
            };

            recognitionRef.current.onend = () => {
              console.log('Speech recognition ended');
              setIsListening(false);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            };
          }
        } catch (err) {
          console.error('Failed to initialize speech recognition:', err);
          setIsSupported(false);
          setError('Speech recognition not supported on this device');
        }
      } else {
        setIsSupported(false);
        setError('Speech recognition not supported in this browser');
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      } else {
        console.warn('Speech synthesis not supported');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleUserSpeech = async (userMessage: string): Promise<void> => {
    try {
      setError('');
      console.log('Processing speech:', userMessage);
      
      // Call your API route with additional debugging
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: `This is during a video call meeting on ${navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'}`,
          conversationHistory: conversationHistory
        }),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.success && data.response) {
        const aiResponse: string = data.response;
        
        // Update conversation history
        const newHistory: ConversationItem[] = [
          ...conversationHistory,
          { user: userMessage, assistant: aiResponse, timestamp: new Date() }
        ].slice(-10); // Keep only last 10 exchanges
        
        setConversationHistory(newHistory);
        
        // Speak the response with mobile-optimized settings
        speakResponse(aiResponse);
        
        // Callback to parent component
        onResponse?.(aiResponse);
        onTranscript?.(userMessage);
        
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
      
    } catch (error) {
      console.error('Error processing speech:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Error processing your message: ' + errorMessage);
      speakResponse("I'm having trouble right now. Can you repeat that?");
    }
  };

  const speakResponse = (text: string): void => {
    if (!synthRef.current || !text) {
      console.warn('TTS not available or no text provided');
      return;
    }

    try {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      // Wait a moment before speaking (helps with mobile)
      setTimeout(() => {
        if (!synthRef.current) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Mobile-optimized TTS settings
        utterance.rate = 0.8; // Slightly slower for mobile
        utterance.pitch = 1;
        utterance.volume = 0.9; // Slightly higher volume
        
        // Try to use a better voice if available
        const voices = synthRef.current.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        if (englishVoices.length > 0) {
          // Prefer female voices as they tend to work better on mobile
          const femaleVoice = englishVoices.find(voice => voice.name.toLowerCase().includes('female'));
          utterance.voice = femaleVoice || englishVoices[0];
        }
        
        utterance.onstart = () => {
          console.log('TTS started');
          setIsSpeaking(true);
        };
        
        utterance.onend = () => {
          console.log('TTS ended');
          setIsSpeaking(false);
        };
        
        utterance.onerror = (error) => {
          console.error('TTS error:', error);
          setIsSpeaking(false);
        };

        synthRef.current.speak(utterance);
      }, 100);
      
    } catch (error) {
      console.error('Error in speakResponse:', error);
      setIsSpeaking(false);
    }
  };

  const toggleListening = async (): Promise<void> => {
    if (!recognitionRef.current || !isSupported) {
      setError('Speech recognition not supported on this device');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      // Request microphone permission explicitly for mobile
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Close the stream immediately as we just wanted to request permission
          stream.getTracks().forEach(track => track.stop());
        } catch (permissionError) {
          console.error('Microphone permission error:', permissionError);
          setError('Microphone permission denied. Please allow microphone access.');
          return;
        }
      }

      setTranscript('');
      setError('');
      recognitionRef.current.start();
      setIsListening(true);
      
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  };

  const stopSpeaking = (): void => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isCallActive || !isSupported) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 
                    md:top-auto md:right-auto md:bottom-4 md:right-4 
                    bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border max-w-[180px]
                    md:max-w-sm md:p-4 z-50">
      <div className="flex items-center gap-1 mb-1">
        <button
          onClick={toggleListening}
          className={`p-1 rounded-full md:p-2 touch-manipulation ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
          }`}
          disabled={isSpeaking}
        >
          {isListening ? <Mic className="w-3 h-3 md:w-4 md:h-4" /> : <MicOff className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        <button
          onClick={stopSpeaking}
          className={`p-1 rounded-full md:p-2 touch-manipulation ${
            isSpeaking 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-300 text-gray-500'
          }`}
          disabled={!isSpeaking}
        >
          {isSpeaking ? <Volume2 className="w-3 h-3 md:w-4 md:h-4" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        <div className="flex-1 text-[10px] md:text-sm">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'} inline-block mr-1 md:mr-2`}></div>
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Click mic'}
        </div>
      </div>
      
      {transcript && (
        <div className="text-[10px] text-gray-600 dark:text-gray-300 mb-1 md:text-sm md:mb-2">
          <strong>You:</strong> {transcript}
        </div>
      )}
      
      {error && (
        <div className="text-[10px] text-red-500 mb-1 md:text-sm md:mb-2">
          {error}
        </div>
      )}
      
      {/* Debug info for mobile */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-[8px] text-gray-500 mt-1">
          UA: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
        </div>
      )}
    </div>
  );
}