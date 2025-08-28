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
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface ConversationItem {
  user: string;
  assistant: string;
  timestamp: Date;
}

interface VoiceHandlerProps {
  isCallActive: boolean;
  meetingId?: string;
  onTranscript?: (transcript: string) => void;
  onResponse?: (response: string) => void;
}

export default function VoiceHandler({ isCallActive, meetingId, onTranscript, onResponse }: VoiceHandlerProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [error, setError] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = (): boolean => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera;
      const uaString = typeof userAgent === 'string' ? userAgent : '';
      const isMobileDevice: boolean = /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(uaString) ||
                             Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };

    checkMobile();
  }, []);

  // Initialize Speech Recognition with mobile-specific handling
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;

    const initializeSpeechRecognition = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition();
          
          if (recognitionRef.current) {
            // Mobile-optimized settings
            recognitionRef.current.continuous = false; // Always false for better mobile compatibility
            recognitionRef.current.interimResults = true; // Enable to catch results
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.maxAlternatives = 1;
            
            // Mobile-specific timeouts
            if (isMobile) {
              recognitionRef.current.grammars = undefined; // Clear grammars for better mobile performance
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
              console.log('🎤 Speech recognition result event:', event);
              console.log('🎤 Results length:', event.results.length);
              console.log('🎤 Is mobile:', isMobile);
              
              let finalTranscript = '';
              let interimTranscript = '';
              
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                
                console.log(`🎤 Result ${i}: "${transcript}" (final: ${event.results[i].isFinal}, confidence: ${confidence})`);
                
                if (event.results[i].isFinal) {
                  finalTranscript += transcript;
                } else {
                  interimTranscript += transcript;
                }
              }

              // Update transcript display immediately
              const displayTranscript = finalTranscript || interimTranscript;
              if (displayTranscript.trim()) {
                setTranscript(displayTranscript.trim());
              }

              // Handle final results OR mobile interim results (mobile often doesn't send final)
              const transcriptToProcess = finalTranscript.trim() || (isMobile && interimTranscript.trim());
              
              if (transcriptToProcess && transcriptToProcess.length > 2) {
                console.log('🎤 Processing transcript:', transcriptToProcess);
                setTranscript(transcriptToProcess);
                
                // Stop listening immediately
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    console.warn('Error stopping recognition:', e);
                  }
                }
                
                // Process the speech
                setTimeout(() => {
                  handleUserSpeech(transcriptToProcess);
                }, 100);
              }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onstart = () => {
              console.log('🎤 Speech recognition started (mobile:', isMobile, ')');
              setIsListening(true);
              setError('');
              setTranscript('');
              
              // Set timeout for mobile devices (more aggressive)
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              timeoutRef.current = setTimeout(() => {
                console.log('⏰ Recognition timeout - forcing stop');
                if (recognitionRef.current && isListening) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    console.warn('Error in timeout stop:', e);
                  }
                }
              }, isMobile ? 6000 : 10000); // Shorter timeout for mobile
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onerror = (event: any) => {
              console.error('Speech recognition error:', event.error);
              
              // Clear timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              setIsListening(false);
              
              // Handle specific mobile errors
              if (event.error === 'no-speech') {
                setError('No speech detected. Try speaking louder.');
              } else if (event.error === 'audio-capture') {
                setError('Microphone access denied or unavailable.');
              } else if (event.error === 'network') {
                setError('Network error. Check your connection.');
              } else if (event.error === 'not-allowed') {
                setError('Microphone permission denied. Please allow microphone access.');
              } else {
                setError(`Speech error: ${event.error}`);
              }
            };

            recognitionRef.current.onend = () => {
              console.log('🎤 Speech recognition ended');
              setIsListening(false);
              
              // Clear timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            };
          }
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
          setError('Speech recognition initialization failed');
        }
      } else {
        setError('Speech recognition not supported in this browser');
      }

      // Initialize Speech Synthesis with mobile handling
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
        
        // Mobile-specific: Pre-load voices
        if (isMobile) {
          const loadVoices = () => {
            const voices = synthRef.current?.getVoices();
            console.log('Available voices:', voices?.length);
          };
          
          loadVoices();
          if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
          }
        }
      }
    };

    // Delay initialization slightly for mobile devices
    if (isMobile) {
      setTimeout(initializeSpeechRecognition, 500);
    } else {
      initializeSpeechRecognition();
    }
    
    isInitializedRef.current = true;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMobile]);

  const handleUserSpeech = useCallback(async (userMessage: string): Promise<void> => {
    if (isProcessing) {
      console.log('❌ Already processing, skipping...');
      return;
    }

    console.log('🚀 Starting handleUserSpeech:', userMessage);
    console.log('🚀 Is mobile:', isMobile);

    try {
      setIsProcessing(true);
      setError('');
      
      // Call your API route with mobile-specific timeout
      const controller = new AbortController();
      const timeoutMs = isMobile ? 20000 : 15000; // Increased timeout for mobile
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after', timeoutMs, 'ms');
        controller.abort();
      }, timeoutMs);
      
      console.log('📡 Making API request...');
      
      const requestBody = {
        message: userMessage,
        context: `This is during a video call meeting${isMobile ? ' on mobile device' : ''}`,
        conversationHistory: conversationHistory,
        meetingId: meetingId // Include meeting ID
      };
      
      console.log('📡 Request body:', requestBody);
      
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📡 API response data:', data);
      
      if (data.success && data.response) {
        const aiResponse: string = data.response;
        console.log('✅ AI response received:', aiResponse);
        
        // Update conversation history
        const newHistory: ConversationItem[] = [
          ...conversationHistory,
          { user: userMessage, assistant: aiResponse, timestamp: new Date() }
        ].slice(-10); // Keep only last 10 exchanges
        
        setConversationHistory(newHistory);
        
        // Clear any error
        setError('');
        
        // Speak the response with mobile optimization
        console.log('🔊 Starting TTS...');
        speakResponse(aiResponse);
        
        // Callback to parent component
        onResponse?.(aiResponse);
        onTranscript?.(userMessage);
        
      } else {
        console.error('❌ API response error:', data);
        const errorMsg = data.error || 'Failed to get AI response';
        setError(errorMsg);
        speakResponse("I'm sorry, I couldn't process that. Could you try again?");
      }
      
    } catch (error) {
      console.error('❌ Error processing speech:', error);
      
      let errorMessage = 'Error processing your message';
      let spokenMessage = "I'm having trouble right now. Can you repeat that?";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
          spokenMessage = "That took too long to process. Can you try again?";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Check your connection.';
          spokenMessage = "I can't connect right now. Check your internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      speakResponse(spokenMessage);
    } finally {
      setIsProcessing(false);
      console.log('🏁 handleUserSpeech finished');
    }
  }, [conversationHistory, isMobile, isProcessing, onResponse, onTranscript]);

  const speakResponse = useCallback((text: string): void => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Mobile-optimized settings
    utterance.rate = isMobile ? 0.8 : 0.9;
    utterance.pitch = 1;
    utterance.volume = isMobile ? 1 : 0.8;
    
    // Select appropriate voice for mobile
    if (isMobile && synthRef.current.getVoices().length > 0) {
      const voices = synthRef.current.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-')) || voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
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

    // Mobile-specific: Add small delay before speaking
    if (isMobile) {
      setTimeout(() => {
        synthRef.current?.speak(utterance);
      }, 100);
    } else {
      synthRef.current.speak(utterance);
    }
  }, [isMobile]);

  const toggleListening = (): void => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      if (isSpeaking) {
        stopSpeaking();
        // Add delay before starting recognition on mobile
        if (isMobile) {
          setTimeout(() => startListening(), 200);
        } else {
          startListening();
        }
      } else {
        startListening();
      }
    }
  };

  const startListening = (): void => {
    setTranscript('');
    setError('');
    
    try {
      // Request microphone permissions explicitly on mobile
      if (isMobile && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            console.log('Microphone permission granted');
            recognitionRef.current?.start();
          })
          .catch((error) => {
            console.error('Microphone permission denied:', error);
            setError('Microphone access required. Please enable microphone permission.');
          });
      } else {
        recognitionRef.current?.start();
      }
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start speech recognition');
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
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isSpeaking || isProcessing}
        >
          {isListening ? <Mic className="w-3 h-3 md:w-4 md:h-4" /> : <MicOff className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        <button
          onClick={stopSpeaking}
          className={`p-1 rounded-full md:p-2 ${
            isSpeaking 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-300 text-gray-500'
          }`}
          disabled={!isSpeaking}
        >
          {isSpeaking ? <Volume2 className="w-3 h-3 md:w-4 md:h-4" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        <div className="flex-1 text-[10px] md:text-sm">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
            isListening ? 'bg-red-500' : 
            isProcessing ? 'bg-yellow-500' :
            isSpeaking ? 'bg-green-500' : 'bg-gray-300'
          } inline-block mr-1 md:mr-2`}></div>
          {isProcessing ? 'Thinking...' :
           isListening ? 'Listening...' : 
           isSpeaking ? 'Speaking...' : 
           isMobile ? 'Tap mic' : 'Click mic'}
        </div>
      </div>
      
      {isMobile && (
        <div className="text-[8px] text-blue-500 mb-1">
          Mobile Mode
        </div>
      )}
      
      {transcript && (
        <div className="text-[10px] text-gray-600 dark:text-gray-300 mb-1 md:text-sm md:mb-2 break-words">
          <strong>You:</strong> {transcript}
        </div>
      )}
      
      {error && (
        <div className="text-[10px] text-red-500 mb-1 md:text-sm md:mb-2 break-words">
          {error}
        </div>
      )}
    </div>
  );
}