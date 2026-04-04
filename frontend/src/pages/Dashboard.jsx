import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const Dashboard = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await axios.get('/api/calculations');
                setRecords(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchRecords();
    }, []);

    if (loading) return <div>Loading records...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Your Tax Dashboard</h2>
                {records.length > 0 && (
                    <Link to="/calculate" className="btn btn-primary">New Calculation</Link>
                )}
            </div>

            {records.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>No calculations yet.</h3>
                    <p style={{ marginBottom: '2rem' }}>Start your first tax calculation to get AI-powered deduction suggestions and smart reports.</p>
                    <Link to="/calculate" className="btn btn-primary">Start Calculate</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {records.map(record => (
                        <div key={record._id} className="glass-card">
                            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                <h3>Year {record.year}</h3>
                                <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>Filed</span>
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total Income</span>
                                    <span>₹{record.calculation.totalIncome.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Taxable Income</span>
                                    <span>₹{record.calculation.taxableIncome.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span style={{ color: 'var(--danger-color)' }}>Tax Owed</span>
                                    <span>₹{record.calculation.taxOwed.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link to={`/report/${record.year}`} className="btn btn-outline" style={{ width: '100%' }}>View Full Report</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
