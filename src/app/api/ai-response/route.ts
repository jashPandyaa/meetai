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

// app/api/ai-response/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface ConversationItem {
  user: string;
  assistant: string;
  timestamp: Date;
}

interface RequestBody {
  message: string;
  context?: string;
  conversationHistory?: ConversationItem[];
}

interface ApiResponse {
  success: boolean;
  response: string;
  timestamp: string;
  error?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Add request logging for debugging
    console.log('API Route called at:', new Date().toISOString());
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({
        success: false,
        error: 'Configuration error',
        response: "I'm not configured properly right now. Please try again later.",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const body = await req.json();
    console.log('Request body received:', { 
      messageLength: body.message?.length,
      hasContext: !!body.context,
      historyLength: body.conversationHistory?.length || 0
    });

    const { message, context, conversationHistory }: RequestBody = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Empty message',
        response: "I didn't catch that. Could you say something?",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 150, // Limit response length for voice
      },
    });

    // Build context from conversation history
    let historyContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyContext = conversationHistory
        .slice(-5) // Only keep last 5 exchanges
        .map(item => `User: ${item.user}\nAssistant: ${item.assistant}`)
        .join('\n');
    }

    const prompt = `You are an AI assistant in a video call meeting. Keep your responses:
- Conversational and natural (like you're speaking)
- Brief (1-2 sentences maximum)
- Helpful and engaging
- Professional but friendly

${historyContext ? `Previous conversation:\n${historyContext}\n` : ''}
${context ? `Current context: ${context}\n` : ''}

User just said: "${message}"

Your response (speak naturally):`;

    console.log('Sending request to Gemini API...');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('Gemini API response received:', {
      responseLength: response.length,
      timestamp: new Date().toISOString()
    });

    if (!response || response.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Empty response from AI',
        response: "I'm thinking... Could you ask me something else?",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      response: response.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    
    let errorMessage = 'Failed to generate response';
    let fallbackResponse = "I'm having trouble connecting right now. Can you try again?";
    
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
      
      // Handle specific error types
      if (error.message.includes('API key')) {
        errorMessage = 'API authentication error';
        fallbackResponse = "I'm having authentication issues. Please try again later.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'API quota exceeded';
        fallbackResponse = "I'm receiving too many requests right now. Please try again in a moment.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network connection error';
        fallbackResponse = "I'm having connection issues. Please check your internet and try again.";
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      response: fallbackResponse,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}