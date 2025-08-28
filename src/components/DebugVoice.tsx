// components/DebugVoice.tsx - Add this temporarily for testing
'use client';

import { useState } from 'react';

export default function DebugVoice() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello, can you hear me?',
          context: 'Test from mobile debug component',
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
    } catch (error) {
      setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testTTS = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Testing text to speech on mobile');
      window.speechSynthesis.speak(utterance);
      setResult('TTS test initiated');
    } else {
      setResult('TTS not supported');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded shadow-lg max-w-xs z-50">
      <h3 className="font-bold mb-2">Debug Mobile Voice</h3>
      
      <div className="space-y-2">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded text-sm"
        >
          {loading ? 'Testing API...' : 'Test API Call'}
        </button>
        
        <button 
          onClick={testTTS}
          className="w-full bg-green-500 text-white p-2 rounded text-sm"
        >
          Test TTS
        </button>
      </div>
      
      {result && (
        <div className="mt-2 text-xs bg-gray-100 p-2 rounded max-h-32 overflow-auto">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}