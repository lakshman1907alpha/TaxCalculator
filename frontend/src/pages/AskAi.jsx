import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ChatAssistant from '../components/ChatAssistant';

const AskAi = () => {
    const [latestRecord, setLatestRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await axios.get('/api/calculations');
                if (res.data && res.data.length > 0) {
                    setLatestRecord(res.data[0]);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchRecords();
    }, []);

    if (loading) return <div>Loading AI Assistant...</div>;

    if (!latestRecord) {
        return (
            <div className="animate-fade-in glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>No calculations found.</h3>
                <p style={{ marginBottom: '2rem' }}>You need to calculate your taxes at least once before asking the AI for personalized advice.</p>
                <Link to="/calculate" className="btn btn-primary">Start Calculate</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>AI Tax Assistant</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Asking regarding your latest calculation (Year {latestRecord.year})
            </p>
            <ChatAssistant taxContext={latestRecord} />
        </div>
    );
};

export default AskAi;
