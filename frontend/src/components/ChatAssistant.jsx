import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatAssistant = ({ taxContext }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchSummary = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.post('/api/ai/summary', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSummary(res.data.summary);
            } catch (err) {
                console.error(err);
                setSummary('Summary unavailable at this time.');
            }
            setIsSummaryLoading(false);
        };
        fetchSummary();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (messageText) => {
        const text = messageText && typeof messageText === 'string' ? messageText : inputValue;
        if (!text.trim()) return;

        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('/api/ai/chat', {
                message: text,
                taxContext: taxContext
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessages([...newMessages, { role: 'ai', content: res.data.reply }]);
        } catch (err) {
            setMessages([...newMessages, { role: 'ai', content: "Sorry, couldn't connect to AI. Try again." }]);
        }
        setIsLoading(false);
    };

    return (
        <div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff', fontFamily: 'sans-serif', margin: '2rem 0' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span role="img" aria-label="sparkles">✨</span> AI Tax Assistant
            </h3>
            
            {/* Top Summary Box */}
            <div style={{ padding: '1.25rem', backgroundColor: '#dcfce7', borderRadius: '8px', marginBottom: '1.5rem', color: '#166534', minHeight: '60px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Your Tax Summary</h4>
                {isSummaryLoading ? <em>Generating intelligent summary...</em> : <p style={{ margin: 0, lineHeight: 1.5 }}>{summary}</p>}
            </div>

            {/* Chat Thread */}
            <div style={{ maxHeight: '360px', overflowY: 'auto', marginBottom: '1.5rem', padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                {messages.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#9ca3af', margin: '2rem 0' }}>Ask me anything about your taxes!</p>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: msg.role === 'user' ? '#3b82f6' : '#e5e7eb', color: msg.role === 'user' ? '#fff' : '#1f2937', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#e5e7eb', color: '#1f2937' }}>
                            <span style={{ display: 'inline-block', letterSpacing: '2px', fontWeight: 'bold' }}>...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {["How can I reduce my tax?", "Why is my tax this high?", "Should I switch regimes?"].map((q, idx) => (
                    <button key={idx} onClick={() => handleSend(q)} style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '20px', cursor: 'pointer', color: '#4b5563', transition: 'all 0.2s' }} disabled={isLoading}>
                        {q}
                    </button>
                ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type your tax question..." style={{ flex: 1, padding: '0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '1rem' }} disabled={isLoading} />
                <button type="submit" disabled={isLoading || !inputValue.trim()} style={{ padding: '0.85rem 1.75rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatAssistant;
