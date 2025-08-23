// call-active.tsx
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import VoiceHandler from "@/components/VoiceHandler";

interface Props {
    onLeave: () => void;
    meetingName: string;
}

interface ConversationItem {
    type: 'user' | 'ai';
    text: string;
    time: Date;
}

export const CallActive = ({ onLeave, meetingName }: Props) => {
    const [aiTranscripts, setAiTranscripts] = useState<ConversationItem[]>([]);
    const [showTranscripts, setShowTranscripts] = useState<boolean>(false);

    return (
        <div className="flex flex-col justify-between p-4 h-full text-white relative">
            <div className="bg-[#101213] rounded-full p-4 flex items-center gap-4">
                <Link href="/" className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
                    <Image src="/logo.svg" width={22} height={22} alt="Logo" />
                </Link>
                <h4 className="text-base">
                    {meetingName}
                </h4>
            </div>
            
            <SpeakerLayout />
            
            <div className="bg-[#101213] rounded-full px-4">
                <CallControls onLeave={onLeave} />
            </div>

            {/* Add Voice Handler - it will show when call is active */}
            <VoiceHandler 
                isCallActive={true} // Since this component only renders during active call
                onTranscript={(transcript) => {
                    setAiTranscripts(prev => [...prev, { 
                        type: 'user', 
                        text: transcript, 
                        time: new Date() 
                    }]);
                    console.log('User said:', transcript);
                }}
                onResponse={(response) => {
                    setAiTranscripts(prev => [...prev, { 
                        type: 'ai', 
                        text: response, 
                        time: new Date() 
                    }]);
                    console.log('AI responded:', response);
                }}
            />

            {/* Optional: Show conversation history */}
            {aiTranscripts.length > 0 && (
                <div className="fixed top-4 left-4 max-w-sm">
                    <button 
                        onClick={() => setShowTranscripts(!showTranscripts)}
                        className="bg-black/50 text-white px-3 py-1 rounded-full text-xs mb-2"
                    >
                        AI Chat ({aiTranscripts.length}) {showTranscripts ? '▼' : '▲'}
                    </button>
                    
                    {showTranscripts && (
                        <div className="max-h-60 overflow-y-auto bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
                            {aiTranscripts.slice(-8).map((item, index) => (
                                <div key={index} className="text-xs mb-2 border-b border-white/10 pb-1">
                                    <span className={`font-semibold ${
                                        item.type === 'user' ? 'text-blue-300' : 'text-green-300'
                                    }`}>
                                        {item.type === 'user' ? 'You' : 'AI'}:
                                    </span>
                                    <div className="text-white/90 mt-1">{item.text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};