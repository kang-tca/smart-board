
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icon } from './Icon';

export const StudentClient: React.FC = () => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to handle participant registration and cleanup
    useEffect(() => {
        let participantIdStr: string | null = null;
        if (joined && sessionId && name) {
            const registerParticipant = async () => {
                try {
                    const { data, error } = await supabase.from('participants').insert({
                        session_id: sessionId,
                        name: name,
                        joined_at: Date.now()
                    }).select('id').single();
                    if (error) throw error;
                    participantIdStr = data.id.toString();
                } catch (e) {
                    console.error("Failed to register participant", e);
                }
            };
            registerParticipant();

            return () => {
                if (participantIdStr) {
                    // Supabase delete() does not return a full Promise with .catch, so we await it in a wrapper.
                    const removeParticipant = async () => {
                        try {
                            await supabase.from('participants').delete().eq('id', participantIdStr);
                            console.log('Participant removed');
                        } catch (err) {
                            console.error("Failed to remove participant", err);
                        }
                    };
                    removeParticipant();
                }
            };
        }
    }, [joined, sessionId, name]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !name) {
            setMessage({ type: 'error', text: 'Please enter code and name.' });
            return;
        }

        try {
            const { data, error } = await supabase.from('sessions')
                .select('id')
                .eq('code', code)
                .eq('active', true)
                .limit(1)
                .single();

            if (error || !data) {
                setMessage({ type: 'error', text: 'Invalid or inactive session code.' });
            } else {
                setSessionId(data.id.toString());
                setJoined(true);
                setMessage(null);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error joining session.' });
        }
    };

    const handleSendText = async () => {
        if (!text.trim()) return;
        await sendData({ type: 'text', content: text });
        setText('');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Basic Image Resize to prevent huge payloads
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

                    await sendData({ type: 'image', content: dataUrl });
                };
            };
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const sendData = async (payload: { type: 'text' | 'image', content: string }) => {
        if (!sessionId) return;
        setIsSending(true);
        setMessage(null);
        try {
            await supabase.from('submissions').insert({
                session_id: sessionId,
                type: payload.type,
                content: payload.content,
                sender: name,
                timestamp: Date.now()
            });

            setMessage({ type: 'success', text: 'Sent successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to send. Session might be closed.' });
            // Optionally check if session is still active
        } finally {
            setIsSending(false);
        }
    };

    const handleLeave = () => {
        setJoined(false);
        setSessionId(null);
        // Effect cleanup will handle removing participant
    };

    if (!joined) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Icon name="users" className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Join Class</h2>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Access Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="123456"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest uppercase"
                                maxLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Student Name"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        {message && (
                            <div className={`text-sm text-center ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                {message.text}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Join Session
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
                <h1 className="text-lg font-bold text-gray-800">Classroom</h1>
                <div className="text-sm text-gray-500">
                    User: <span className="font-medium text-gray-800">{name}</span>
                </div>
            </header>

            <div className="flex-grow p-4 flex flex-col items-center max-w-md mx-auto w-full">

                <div className="flex w-full bg-white rounded-lg shadow p-1 mb-6">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'text' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Text
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'image' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Image
                    </button>
                </div>

                <div className="w-full bg-white rounded-lg shadow p-6">
                    {activeTab === 'text' ? (
                        <div className="space-y-4">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <button
                                onClick={handleSendText}
                                disabled={isSending || !text.trim()}
                                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition-colors"
                            >
                                {isSending ? 'Sending...' : 'Send Text'} <Icon name="send" className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <Icon name="photo" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Tap to upload image</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {isSending && <p className="text-sm text-blue-600">Uploading...</p>}
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`mt-4 px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-all ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <button
                onClick={handleLeave}
                className="mb-6 text-gray-400 text-sm underline hover:text-gray-600"
            >
                Leave Session
            </button>
        </div>
    );
};
