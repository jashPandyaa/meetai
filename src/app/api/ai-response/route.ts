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
    const { message, context, conversationHistory }: RequestBody = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({
      success: true,
      response: response.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate response',
      response: "I'm having trouble connecting right now. Can you try again?",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}