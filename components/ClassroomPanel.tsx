
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from './Icon';

interface ClassroomPanelProps {
    onClose: () => void;
    onDropItem: (item: { type: 'text' | 'image', content: string }) => void;
    currentUserId: string;
}

interface Submission {
    id: string;
    type: 'text' | 'image';
    content: string;
    sender: string;
    timestamp: number;
}

interface Participant {
    id: string;
    name: string;
    joinedAt: number;
}

export const ClassroomPanel: React.FC<ClassroomPanelProps> = ({ onClose, onDropItem, currentUserId }) => {
    const [sessionCode, setSessionCode] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'inbox' | 'students'>('inbox');

    // Cleanup on unmount (delete session) - optional, but good for ephemeral sessions
    useEffect(() => {
        return () => {
            if (sessionId) {
                // We might want to keep session active even if panel closes, 
                // but for now let's assume closing panel doesn't kill session immediately,
                // explicit "Stop" is better.
            }
        };
    }, [sessionId]);

    const startSession = async () => {
        setIsLoading(true);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        try {
            const { data, error } = await supabase.from('smartboard_sessions').insert({
                host_id: currentUserId,
                code,
                active: true,
                created_at: Date.now()
            }).select('id').single();
            if (error) throw error;

            const newSessionId = data.id.toString();
            setSessionId(newSessionId);
            setSessionCode(code);

            // Listen for submissions
            const subChannel = supabase.channel(`public:smartboard_submissions:session_id=eq.${newSessionId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'smartboard_submissions', filter: `session_id=eq.${newSessionId}` }, payload => {
                    setSubmissions(prev => [{
                        id: payload.new.id.toString(),
                        type: payload.new.type,
                        content: payload.new.content,
                        sender: payload.new.sender,
                        timestamp: payload.new.timestamp
                    }, ...prev]);
                }).subscribe();

            // Listen for participants
            const partChannel = supabase.channel(`public:smartboard_participants:session_id=eq.${newSessionId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'smartboard_participants', filter: `session_id=eq.${newSessionId}` }, payload => {
                    setParticipants(prev => [{
                        id: payload.new.id.toString(),
                        name: payload.new.name,
                        joinedAt: payload.new.joined_at
                    }, ...prev]);
                }).subscribe();

            // Should properly store unsubscribes, but simplistic approach here for now since component doesn't typically unmount without stopping session in this flow

        } catch (error) {
            console.error("Failed to start session", error);
            alert("Failed to start session.");
        } finally {
            setIsLoading(false);
        }
    };

    const stopSession = async () => {
        if (!sessionId) return;
        if (window.confirm("Are you sure you want to stop the session? Students will be disconnected.")) {
            await supabase.from('smartboard_sessions').update({ active: false }).eq('id', sessionId);
            setSessionId(null);
            setSessionCode(null);
            setSubmissions([]);
            setParticipants([]);
        }
    };

    const handleSubmissionClick = (sub: Submission) => {
        onDropItem({ type: sub.type, content: sub.content });
        // Optional: Remove from list after adding?
        // For now, keep it so it can be added multiple times if needed
    };

    const getJoinUrl = () => {
        return `${window.location.origin}${window.location.pathname}?student=true`;
    };

    return (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 z-30 w-80 max-h-[85vh] flex flex-col animate-fade-in-right">
            <div className="flex justify-between items-center p-3 border-b bg-indigo-50 rounded-t-lg">
                <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                    <Icon name="users" className="w-5 h-5 text-indigo-600" />
                    Classroom
                </h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-indigo-100">
                    <Icon name="exit" className="w-5 h-5 text-indigo-400" />
                </button>
            </div>

            <div className="p-4 flex flex-col items-center border-b">
                {!sessionCode ? (
                    <div className="text-center w-full">
                        <p className="text-sm text-gray-600 mb-4">Allow students to submit text and images to your board.</p>
                        <button
                            onClick={startSession}
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 shadow-sm transition-colors font-medium flex justify-center items-center"
                        >
                            {isLoading ? 'Creating...' : 'Start Session'}
                        </button>
                    </div>
                ) : (
                    <div className="w-full text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Join Code</p>
                        <div className="text-4xl font-mono font-bold text-indigo-600 tracking-wider mb-2 select-all">
                            {sessionCode}
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 break-all mb-3 select-all cursor-pointer hover:bg-gray-200" onClick={() => navigator.clipboard.writeText(getJoinUrl())}>
                            {getJoinUrl()}
                        </div>
                        <button
                            onClick={stopSession}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            Stop Session
                        </button>
                    </div>
                )}
            </div>

            {sessionCode && (
                <>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wide ${activeTab === 'inbox' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            Inbox ({submissions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wide ${activeTab === 'students' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            Students ({participants.length})
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto bg-gray-50 flex flex-col min-h-0">
                        {activeTab === 'inbox' ? (
                            <>
                                {submissions.length === 0 ? (
                                    <div className="flex-grow flex flex-col items-center justify-center p-6 text-gray-400 text-sm">
                                        <div className="animate-pulse mb-2">waiting...</div>
                                        <p>Submissions will appear here.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {submissions.map((sub) => (
                                            <li
                                                key={sub.id}
                                                onClick={() => handleSubmissionClick(sub)}
                                                className="p-3 bg-white hover:bg-blue-50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm text-gray-800">{sub.sender}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(sub.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                {sub.type === 'text' ? (
                                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 line-clamp-3">
                                                        {sub.content}
                                                    </p>
                                                ) : (
                                                    <div className="mt-1 rounded-md overflow-hidden border border-gray-200 h-24 bg-gray-100 flex items-center justify-center">
                                                        <img src={sub.content} alt="submission" className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                )}
                                                <div className="mt-2 text-right">
                                                    <span className="text-xs text-blue-600 font-medium hover:underline">Click to Add to Board</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            /* Students List */
                            <>
                                {participants.length === 0 ? (
                                    <div className="flex-grow flex flex-col items-center justify-center p-6 text-gray-400 text-sm">
                                        <p>No students joined yet.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 bg-white">
                                        {participants.map((p) => (
                                            <li key={p.id} className="p-3 flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                        {p.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
            <style>{`
            @keyframes fade-in-right {
                from { opacity: 0; transform: translateX(10px); }
                to { opacity: 1; transform: translateX(0); }
            }
            .animate-fade-in-right { animation: fade-in-right 0.2s ease-out; }
           `}</style>
        </div>
    );
};
