//components/VoiceHandler.tsx
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
  const lastProcessedTranscript = useRef<string>('');

  // Improved mobile detection
  useEffect(() => {
    const checkMobile = (): boolean => {
      // Check multiple mobile indicators
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile'];
      const hasMobileKeyword = mobileKeywords.some(keyword => userAgent.includes(keyword));
      
      // More comprehensive mobile detection
      const isMobileDevice = isTouchDevice || hasMobileKeyword || 
        (isSmallScreen && navigator.userAgent.includes('Mobile'));
      
      console.log('🔍 Mobile detection:', {
        isTouchDevice,
        isSmallScreen,
        hasMobileKeyword,
        userAgent: userAgent.substring(0, 50) + '...',
        finalResult: isMobileDevice
      });
      
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };

    checkMobile();
    
    // Re-check on window resize
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
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
            // Optimized settings for both desktop and mobile
            recognitionRef.current.continuous = false; // Always false for reliability
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.maxAlternatives = 1;
            
            // Mobile-specific optimizations
            if (isMobile) {
              recognitionRef.current.grammars = undefined;
            }

            // Improved result handling
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
              console.log('🎤 Speech result event:', {
                resultsLength: event.results.length,
                resultIndex: event.resultIndex,
                isMobile
              });
              
              let finalTranscript = '';
              let interimTranscript = '';
              
              // Process all results from the current result index
              for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result[0].transcript;
                const confidence = result[0].confidence;
                const isFinal = result.isFinal;
                
                console.log(`🎤 Result ${i}:`, {
                  transcript: `"${transcript}"`,
                  isFinal,
                  confidence,
                  length: transcript.length
                });
                
                if (isFinal) {
                  finalTranscript += transcript;
                } else {
                  interimTranscript += transcript;
                }
              }

              // Update display transcript immediately
              const displayTranscript = finalTranscript || interimTranscript;
              if (displayTranscript.trim()) {
                setTranscript(displayTranscript.trim());
              }

              // Determine what to process
              let transcriptToProcess = '';
              
              if (finalTranscript.trim()) {
                // We have final results - use them
                transcriptToProcess = finalTranscript.trim();
                console.log('🎤 Using final transcript:', transcriptToProcess);
              } else if (isMobile && interimTranscript.trim().length > 3) {
                // On mobile, process interim results if they're substantial
                // and haven't been processed yet
                const interim = interimTranscript.trim();
                if (interim !== lastProcessedTranscript.current && interim.length > 3) {
                  transcriptToProcess = interim;
                  console.log('🎤 Using mobile interim transcript:', transcriptToProcess);
                }
              }

              // Process if we have something new and meaningful
              if (transcriptToProcess && 
                  transcriptToProcess.length > 2 && 
                  transcriptToProcess !== lastProcessedTranscript.current) {
                
                lastProcessedTranscript.current = transcriptToProcess;
                console.log('🎤 Processing transcript:', transcriptToProcess);
                
                // Stop listening
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    console.warn('Error stopping recognition:', e);
                  }
                }
                
                // Process with slight delay for mobile
                setTimeout(() => {
                  handleUserSpeech(transcriptToProcess);
                }, isMobile ? 200 : 100);
              }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onstart = () => {
              console.log('🎤 Speech recognition started (mobile:', isMobile, ')');
              setIsListening(true);
              setError('');
              setTranscript('');
              lastProcessedTranscript.current = '';
              
              // Clear any existing timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              // Set appropriate timeout based on device
              const timeoutMs = isMobile ? 8000 : 12000;
              timeoutRef.current = setTimeout(() => {
                console.log('⏰ Recognition timeout after', timeoutMs, 'ms');
                if (recognitionRef.current && isListening) {
                  try {
                    recognitionRef.current.stop();
                  } catch (e) {
                    console.warn('Error in timeout stop:', e);
                  }
                }
              }, timeoutMs);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onerror = (event: any) => {
              console.error('🎤 Speech recognition error:', event.error);
              
              // Clear timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              setIsListening(false);
              
              // Handle specific errors
              const errorMessages: Record<string, string> = {
                'no-speech': 'No speech detected. Try speaking louder.',
                'audio-capture': 'Microphone not available.',
                'not-allowed': 'Microphone permission denied.',
                'network': 'Network error. Check connection.',
                'service-not-allowed': 'Speech service not available.',
                'bad-grammar': 'Speech recognition error.',
                'language-not-supported': 'Language not supported.'
              };
              
              setError(errorMessages[event.error] || `Speech error: ${event.error}`);
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
          setError('Speech recognition not available');
        }
      } else {
        console.warn('Speech recognition not supported');
        setError('Speech recognition not supported');
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
        
        // Load voices for mobile
        if (isMobile) {
          const loadVoices = () => {
            const voices = synthRef.current?.getVoices() || [];
            console.log('🔊 Available voices:', voices.length);
          };
          
          loadVoices();
          if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
          }
        }
      }
    };

    // Initialize with appropriate delay for mobile
    if (isMobile) {
      setTimeout(initializeSpeechRecognition, 1000);
    } else {
      initializeSpeechRecognition();
    }
    
    isInitializedRef.current = true;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Cleanup error:', e);
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

    console.log('🚀 Processing speech:', {
      message: userMessage,
      isMobile,
      messageLength: userMessage.length
    });

    try {
      setIsProcessing(true);
      setError('');
      
      const controller = new AbortController();
      const timeoutMs = isMobile ? 25000 : 20000; // Increased timeout for mobile
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after', timeoutMs, 'ms');
        controller.abort();
      }, timeoutMs);
      
      const requestBody = {
        message: userMessage,
        context: `Video call meeting${isMobile ? ' on mobile device' : ''}`,
        conversationHistory: conversationHistory.slice(-5), // Keep fewer items for mobile
        meetingId: meetingId
      };
      
      console.log('📡 API Request:', {
        messageLength: userMessage.length,
        isMobile,
        historyLength: conversationHistory.length
      });
      
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 API response:', {
        success: data.success,
        responseLength: data.response?.length || 0,
        hasError: !!data.error
      });
      
      if (data.success && data.response) {
        const aiResponse: string = data.response;
        
        // Update conversation history
        const newHistory: ConversationItem[] = [
          ...conversationHistory,
          { user: userMessage, assistant: aiResponse, timestamp: new Date() }
        ].slice(-8); // Keep fewer items for mobile performance
        
        setConversationHistory(newHistory);
        setError('');
        
        console.log('🔊 Starting TTS with response:', aiResponse.substring(0, 50) + '...');
        speakResponse(aiResponse);
        
        // Callbacks
        onResponse?.(aiResponse);
        onTranscript?.(userMessage);
        
      } else {
        console.error('❌ API response error:', data);
        const errorMsg = data.error || 'No response received';
        setError(errorMsg);
        speakResponse("Sorry, I couldn't process that. Please try again.");
      }
      
    } catch (error) {
      console.error('❌ Error in handleUserSpeech:', error);
      
      let errorMessage = 'Processing error';
      let spokenMessage = "Something went wrong. Please try again.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out';
          spokenMessage = "That took too long. Please try again.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error';
          spokenMessage = "Connection problem. Check your internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      speakResponse(spokenMessage);
    } finally {
      setIsProcessing(false);
      console.log('🏁 handleUserSpeech completed');
    }
  }, [conversationHistory, isMobile, isProcessing, meetingId, onResponse, onTranscript]);

  const speakResponse = useCallback((text: string): void => {
    if (!synthRef.current || !text) {
      console.warn('🔊 TTS not available or no text');
      return;
    }

    console.log('🔊 Speaking:', text.substring(0, 50) + '...');

    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Optimized settings for mobile
    if (isMobile) {
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a good voice on mobile
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en-') && voice.localService
        ) || voices.find(voice => 
          voice.lang.startsWith('en-')
        ) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log('🔊 Using voice:', preferredVoice.name);
        }
      }
    } else {
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
    }
    
    utterance.onstart = () => {
      console.log('🔊 TTS started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('🔊 TTS ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (error) => {
      console.error('🔊 TTS error:', error);
      setIsSpeaking(false);
    };

    // Mobile-specific: Add delay and ensure synthesis is ready
    if (isMobile) {
      // Ensure voices are loaded
      if (synthRef.current.getVoices().length === 0) {
        console.log('🔊 Waiting for voices...');
        synthRef.current.onvoiceschanged = () => {
          console.log('🔊 Voices loaded, speaking now');
          synthRef.current?.speak(utterance);
        };
      } else {
        setTimeout(() => {
          synthRef.current?.speak(utterance);
        }, 200);
      }
    } else {
      synthRef.current.speak(utterance);
    }
  }, [isMobile]);

 // components/VoiceHandler.tsx

  const toggleListening = (): void => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    console.log('🎤 Toggle listening:', { 
      currentlyListening: isListening, 
      isSpeaking, 
      isMobile,
      isProcessing
    });

    if (isListening) {
      // Stop listening
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Start listening
      if (isSpeaking) {
        stopSpeaking();
      }

      // ======================= FIX STARTS HERE =======================
      // MOBILE AUDIO WORKAROUND: "Warm up" the TTS engine with a silent utterance.
      // This must be triggered by a direct user action (this button click).
      if (isMobile && synthRef.current && !synthRef.current.speaking) {
        console.log('🔊 WARMING UP TTS ENGINE (MOBILE WORKAROUND)');
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0; // Make it completely silent
        synthRef.current.speak(silentUtterance);
      }
      // ======================== FIX ENDS HERE ========================
      
      // Add delay before starting recognition (especially for mobile)
      const startDelay = isMobile ? 300 : 100;
      setTimeout(() => {
        startListening();
      }, startDelay);
    }
  };
  const startListening = (): void => {
    console.log('🎤 Starting listening process...');
    
    setTranscript('');
    setError('');
    lastProcessedTranscript.current = '';
    
    try {
      // For mobile, explicitly request microphone permission
      if (isMobile && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('🎤 Requesting mobile microphone permission...');
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        })
          .then((stream) => {
            console.log('🎤 Microphone permission granted');
            // Release the stream immediately as we only needed permission
            stream.getTracks().forEach(track => track.stop());
            
            // Now start recognition
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                console.error('Error starting recognition after permission:', e);
                setError('Could not start speech recognition');
              }
            }, 100);
          })
          .catch((error) => {
            console.error('🎤 Microphone permission denied:', error);
            setError('Microphone access required. Please enable in browser settings.');
          });
      } else {
        // Desktop or fallback
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
          className={`p-1 rounded-full md:p-2 transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isProcessing}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <Mic className="w-3 h-3 md:w-4 md:h-4" /> : <MicOff className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        <button
          onClick={stopSpeaking}
          className={`p-1 rounded-full md:p-2 transition-all ${
            isSpeaking 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-300 text-gray-500'
          }`}
          disabled={!isSpeaking}
          aria-label={isSpeaking ? 'Stop speaking' : 'Not speaking'}
        >
          {isSpeaking ? <Volume2 className="w-3 h-3 md:w-4 md:h-4" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        <div className="flex-1 text-[10px] md:text-sm">
          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
            isProcessing ? 'bg-yellow-500 animate-pulse' :
            isListening ? 'bg-red-500 animate-pulse' : 
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
          📱 Mobile Mode Active
        </div>
      )}
      
      {transcript && (
        <div className="text-[10px] text-gray-600 dark:text-gray-300 mb-1 md:text-sm md:mb-2 break-words">
          <strong>You:</strong> {transcript}
        </div>
      )}
      
      {error && (
        <div className="text-[10px] text-red-500 mb-1 md:text-sm md:mb-2 break-words">
          ⚠️ {error}
        </div>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-[8px] text-gray-500 mt-1 border-t pt-1">
          Mobile: {isMobile ? 'Yes' : 'No'} | 
          Proc: {isProcessing ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}

