// // app/api/ai-response/route.ts
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { NextRequest, NextResponse } from 'next/server';

// interface ConversationItem {
//   user: string;
//   assistant: string;
//   timestamp: Date;
// }

// interface RequestBody {
//   message: string;
//   context?: string;
//   conversationHistory?: ConversationItem[];
// }

// interface ApiResponse {
//   success: boolean;
//   response: string;
//   timestamp: string;
//   error?: string;
// }

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
//   try {
//     const { message, context, conversationHistory }: RequestBody = await req.json();

//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//     // Build context from conversation history
//     let historyContext = '';
//     if (conversationHistory && conversationHistory.length > 0) {
//       historyContext = conversationHistory
//         .slice(-5) // Only keep last 5 exchanges
//         .map(item => `User: ${item.user}\nAssistant: ${item.assistant}`)
//         .join('\n');
//     }

//     const prompt = `You are an AI assistant in a video call meeting. Keep your responses:
// - Conversational and natural (like you're speaking)
// - Brief (1-2 sentences maximum)
// - Helpful and engaging
// - Professional but friendly

// ${historyContext ? `Previous conversation:\n${historyContext}\n` : ''}
// ${context ? `Current context: ${context}\n` : ''}

// User just said: "${message}"

// Your response (speak naturally):`;

//     const result = await model.generateContent(prompt);
//     const response = result.response.text();

//     return NextResponse.json({
//       success: true,
//       response: response.trim(),
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('Gemini API error:', error);
    
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to generate response',
//       response: "I'm having trouble connecting right now. Can you try again?",
//       timestamp: new Date().toISOString()
//     }, { status: 500 });
//   }
// }

// // app/api/ai-response/route.ts
// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
// import { NextRequest, NextResponse } from 'next/server';

// interface ConversationItem {
//   user: string;
//   assistant: string;
//   timestamp: Date;
// }

// interface RequestBody {
//   message: string;
//   context?: string;
//   conversationHistory?: ConversationItem[];
// }

// interface ApiResponse {
//   success: boolean;
//   response: string;
//   timestamp: string;
//   error?: string;
// }

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
//   try {
//     // Add request logging for debugging
//     console.log('API Route called at:', new Date().toISOString());
    
//     // Check if API key is available
//     if (!process.env.GEMINI_API_KEY) {
//       console.error('GEMINI_API_KEY is not set');
//       return NextResponse.json({
//         success: false,
//         error: 'Configuration error',
//         response: "I'm not configured properly right now. Please try again later.",
//         timestamp: new Date().toISOString()
//       }, { status: 500 });
//     }

//     const body = await req.json();
//     console.log('📡 Request body received:', { 
//       messageLength: body.message?.length,
//       hasContext: !!body.context,
//       historyLength: body.conversationHistory?.length || 0,
//       message: body.message, // Log the actual message for debugging
//       isMobile: body.context?.includes('mobile device'),
//       timestamp: new Date().toISOString()
//     });

//     const { message, context, conversationHistory }: RequestBody = body;

//     if (!message || message.trim().length === 0) {
//       return NextResponse.json({
//         success: false,
//         error: 'Empty message',
//         response: "I didn't catch that. Could you say something?",
//         timestamp: new Date().toISOString()
//       }, { status: 400 });
//     }

//     // Check for mobile context
//     const isMobileRequest = context?.includes('mobile device');
    
//     const model = genAI.getGenerativeModel({ 
//       model: 'gemini-1.5-flash',
//       generationConfig: {
//         temperature: 0.7,
//         topK: 40,
//         topP: 0.8,
//         maxOutputTokens: isMobileRequest ? 100 : 150, // Shorter responses for mobile
//         candidateCount: 1,
//         stopSequences: [],
//       },
//       safetySettings: [
//         {
//           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, 
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//           threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//         },
//       ],
//     });

//     // Build context from conversation history
//     let historyContext = '';
//     if (conversationHistory && conversationHistory.length > 0) {
//       historyContext = conversationHistory
//         .slice(-3) // Only keep last 3 exchanges for mobile optimization
//         .map(item => `User: ${item.user}\nAssistant: ${item.assistant}`)
//         .join('\n');
//     }

//     // Mobile-optimized prompt
//     const prompt = `You are an AI assistant in a video call meeting. Keep your responses:
// - VERY brief (1 sentence maximum${isMobileRequest ? ' for mobile' : ''})
// - Conversational and natural (like speaking to a friend)
// - Helpful and engaging
// - Professional but friendly
// - Direct and to the point

// ${historyContext ? `Recent chat:\n${historyContext}\n` : ''}
// ${context ? `Context: ${context}\n` : ''}

// User said: "${message}"

// Reply briefly and naturally:`;

//     console.log('🤖 Sending request to Gemini API...');
//     console.log('🤖 Prompt preview:', prompt.substring(0, 200) + '...');
    
//     // Set timeout for mobile requests
//     const timeout = new Promise((_, reject) => 
//       setTimeout(() => reject(new Error('Request timeout')), isMobileRequest ? 15000 : 10000)
//     );
    
//     const apiCall = model.generateContent(prompt);
    
//     const result = await Promise.race([apiCall, timeout]) as Awaited<ReturnType<typeof model.generateContent>>;
//     const response = result.response.text();

//     console.log('Gemini API response received:', {
//       responseLength: response.length,
//       timestamp: new Date().toISOString(),
//       isMobile: isMobileRequest,
//       response: response.substring(0, 100) + '...' // Log first 100 chars for debugging
//     });

//     if (!response || response.trim().length === 0) {
//       console.warn('Empty response from Gemini API');
//       return NextResponse.json({
//         success: false,
//         error: 'Empty response from AI',
//         response: "I'm thinking... Could you ask me something else?",
//         timestamp: new Date().toISOString()
//       }, { status: 500 });
//     }

//     // Clean up the response - remove any markdown or special formatting
//     let cleanResponse = response.trim()
//       .replace(/\*\*/g, '') // Remove bold markdown
//       .replace(/\*/g, '')   // Remove italic markdown  
//       .replace(/`/g, '')    // Remove code markdown
//       .replace(/#+\s/g, '') // Remove headers
//       .replace(/\n+/g, ' ') // Replace newlines with spaces
//       .replace(/\s+/g, ' ') // Normalize spaces
//       .trim();

//     // Ensure response isn't too long for TTS
//     if (cleanResponse.length > (isMobileRequest ? 200 : 300)) {
//       const sentences = cleanResponse.split(/[.!?]+/);
//       cleanResponse = sentences[0] + (sentences[0].match(/[.!?]$/) ? '' : '.');
//     }

//     return NextResponse.json({
//       success: true,
//       response: cleanResponse,
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('Gemini API error:', error);
    
//     let errorMessage = 'Failed to generate response';
//     let fallbackResponse = "I'm having trouble connecting right now. Can you try again?";
    
//     if (error instanceof Error) {
//       console.error('Error details:', error.message, error.stack);
      
//       // Handle specific error types
//       if (error.message.includes('API key') || error.message.includes('authentication')) {
//         errorMessage = 'API authentication error';
//         fallbackResponse = "I'm having authentication issues. Please try again later.";
//       } else if (error.message.includes('quota') || error.message.includes('limit')) {
//         errorMessage = 'API quota exceeded';
//         fallbackResponse = "I'm receiving too many requests right now. Please try again in a moment.";
//       } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('timeout')) {
//         errorMessage = 'Network connection error';
//         fallbackResponse = "I'm having connection issues. Please check your internet and try again.";
//       } else if (error.message.includes('SAFETY')) {
//         errorMessage = 'Content safety filter triggered';
//         fallbackResponse = "I can't respond to that. Could you ask something else?";
//       } else if (error.message.includes('timeout')) {
//         errorMessage = 'Request timeout';
//         fallbackResponse = "That took too long to process. Can you try a shorter question?";
//       }
//     }
    
//     return NextResponse.json({
//       success: false,
//       error: errorMessage,
//       response: fallbackResponse,
//       timestamp: new Date().toISOString()
//     }, { status: 500 });
//   }
// }

// app/api/ai-response/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ConversationItem {
  user: string;
  assistant: string;
  timestamp: Date;
}

interface RequestBody {
  message: string;
  context?: string;
  conversationHistory?: ConversationItem[];
  meetingId?: string;
}

interface ApiResponse {
  success: boolean;
  response: string;
  timestamp: string;
  error?: string;
  debug?: Record<string, unknown>;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const startTime = Date.now();
  
  try {
    console.log('📱 AI Response API called at:', new Date().toISOString());
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set');
      return NextResponse.json({
        success: false,
        error: 'Configuration error',
        response: "I'm not configured properly right now. Please try again later.",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        response: "I couldn't understand the request format. Please try again.",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const { message, context, conversationHistory, meetingId } = body;

    console.log('📱 Request details:', { 
      messageLength: message?.length || 0,
      hasContext: !!context,
      historyLength: conversationHistory?.length || 0,
      isMobile: context?.includes('mobile device'),
      meetingId,
      userAgent: req.headers.get('user-agent')?.substring(0, 50) + '...'
    });

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Empty message',
        response: "I didn't hear anything. Could you speak again?",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Clean the message
    const cleanMessage = message.trim();
    if (cleanMessage.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Message too short',
        response: "Could you say that again more clearly?",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get meeting context
    let meetingAgent = null;
    if (meetingId) {
      try {
        const [meeting] = await db
          .select()
          .from(meetings)
          .where(eq(meetings.id, meetingId));
          
        if (meeting) {
          [meetingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, meeting.agentId));
            
          console.log('📋 Found meeting agent:', meetingAgent?.name || 'Unknown');
        }
      } catch (dbError) {
        console.warn('⚠️ Database error (continuing without context):', dbError);
      }
    }

    const isMobileRequest = context?.includes('mobile device');
    console.log('📱 Is mobile request:', isMobileRequest);
    
    // Configure model for mobile optimization
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.6,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: isMobileRequest ? 60 : 100,
        candidateCount: 1,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, 
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Build conversation context
    let historyContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const historyLimit = isMobileRequest ? 2 : 3;
      historyContext = conversationHistory
        .slice(-historyLimit)
        .map(item => `User: ${item.user}\nAssistant: ${item.assistant}`)
        .join('\n');
    }

    // Create optimized prompt for mobile
    const baseInstructions = meetingAgent?.instructions || 
      'You are a helpful AI assistant participating in a video call meeting.';

    const mobileSuffix = isMobileRequest ? ' (Mobile user - be extra concise!)' : '';
    
    const prompt = `${baseInstructions}${mobileSuffix}

CRITICAL REQUIREMENTS:
- Respond in exactly ONE short sentence (maximum ${isMobileRequest ? '8' : '12'} words)
- Be conversational and natural (like talking to someone face-to-face)
- No markdown, formatting, or special characters
- Sound like you're speaking directly to them
- Be helpful and friendly

${historyContext ? `Recent conversation:\n${historyContext}\n` : ''}
${context ? `Context: ${context}\n` : ''}

User said: "${cleanMessage}"

Respond naturally in one brief sentence:`;

    console.log('🤖 Calling Gemini API with prompt length:', prompt.length);
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('🤖 Gemini response received:', {
      responseLength: response?.length || 0,
      isMobile: isMobileRequest,
      hasAgent: !!meetingAgent,
      processingTime: Date.now() - startTime
    });

    if (!response || response.trim().length === 0) {
      console.warn('⚠️ Empty response from Gemini');
      return NextResponse.json({
        success: false,
        error: 'Empty AI response',
        response: "I'm thinking... Could you ask me something else?",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Clean and optimize response for TTS
    let cleanResponse = response.trim()
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '')   // Remove italic markdown  
      .replace(/`/g, '')    // Remove code markdown
      .replace(/#+\s/g, '') // Remove headers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/[""'']/g, '"') // Normalize quotes for TTS
      .trim();

    // Ensure response is appropriate length for mobile TTS
    if (isMobileRequest && cleanResponse.length > 150) {
      const sentences = cleanResponse.split(/[.!?]+/);
      cleanResponse = sentences[0].trim() + (sentences[0].match(/[.!?]$/) ? '' : '.');
    }

    // Final validation
    if (!cleanResponse || cleanResponse.length === 0) {
      cleanResponse = "I understand. What else can I help with?";
    }

    console.log('✅ Response ready:', {
      originalLength: response.length,
      cleanedLength: cleanResponse.length,
      preview: cleanResponse.substring(0, 30) + '...',
      processingTime: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      response: cleanResponse,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          isMobile: isMobileRequest,
          processingTime: Date.now() - startTime,
          originalLength: response.length,
          cleanedLength: cleanResponse.length,
          hasAgent: !!meetingAgent
        }
      })
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Gemini API error:', error);
    
    let errorMessage = 'Failed to generate response';
    let fallbackResponse = "I'm having trouble right now. Can you try again?";
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200)
      });
      
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = 'API authentication error';
        fallbackResponse = "I'm having authentication issues. Please try again later.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'API quota exceeded';
        fallbackResponse = "I'm receiving too many requests. Please wait a moment.";
      } else if (error.message.includes('SAFETY')) {
        errorMessage = 'Content safety filter triggered';
        fallbackResponse = "I can't respond to that. Could you ask something else?";
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout';
        fallbackResponse = "That took too long to process. Please try again.";
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          processingTime,
          errorType: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    }, { status: 500 });
  }
}