// components/DebugVoice.tsx
'use client';

import { useState, useEffect } from 'react';

export default function DebugVoice() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: string, message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-20), `[${timestamp}] ${type}: ${message}`]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('LOG', args.join(' '));
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('ERROR', args.join(' '));
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('WARN', args.join(' '));
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 bg-red-500 text-white px-2 py-1 rounded text-xs z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 p-4 overflow-auto">
      <div className="bg-white rounded p-4 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Voice Debug Console</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setLogs([])}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Close
            </button>
          </div>
        </div>
        
        <div className="bg-black text-green-400 p-2 rounded h-96 overflow-y-auto font-mono text-xs">
          {logs.map((log, index) => (
            <div key={index} className="mb-1 break-words">
              {log}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500">No logs yet... Start speaking to see debug info</div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-600">
          <p><strong>Instructions:</strong></p>
          <p>1. Click the microphone button</p>
          <p>2. Say something clearly</p>
          <p>3. Watch the logs above to see what happens</p>
          <p>4. Look for any errors or missing API responses</p>
        </div>
      </div>
    </div>
  );
}