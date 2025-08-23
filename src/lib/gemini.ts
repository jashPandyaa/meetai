// lib/gemini.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface ConversationItem {
  user: string;
  assistant: string;
  timestamp: Date;
}

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export class GeminiVoiceAssistant {
  private model: GenerativeModel;
  private conversationHistory: ConversationItem[] = [];

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateResponse(userInput: string, context: string = ''): Promise<string> {
    try {
      const prompt = `You are an AI assistant in a video call. Keep responses conversational, concise (1-2 sentences max), and natural for voice conversation.

Context: ${context}
User said: ${userInput}

Respond naturally as if speaking:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      this.conversationHistory.push({
        user: userInput,
        assistant: response,
        timestamp: new Date()
      });

      return response;
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble connecting right now. Can you repeat that?";
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ConversationItem[] {
    return this.conversationHistory;
  }
}

export class TextToSpeech {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('TextToSpeech can only be used in browser environment');
    }
    
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
  }

  speak(text: string, options: TTSOptions = {}): void {
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en')
    );
    
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }

    utterance.onstart = () => {
      console.log('TTS started');
      options.onStart?.();
    };
    
    utterance.onend = () => {
      console.log('TTS ended');
      options.onEnd?.();
    };
    
    utterance.onerror = (error) => {
      console.error('TTS error:', error);
      options.onError?.(error);
    };

    this.synth.speak(utterance);
  }

  stop(): void {
    this.synth.cancel();
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}