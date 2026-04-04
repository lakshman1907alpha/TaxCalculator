import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import RegimeComparison from '../components/RegimeComparison';

const Compare = () => {
    const { year } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const res = await axios.get(`/api/calculations/${year}`);
                setRecord(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchRecord();
    }, [year]);

    if (loading) return <div>Loading comparison...</div>;
    if (!record) return <div>No record found for year {year}. <Link to="/calculate">Calculate now</Link></div>;

    if (!record.regimeComparison) {
        return (
            <div className="animate-fade-in glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Comparison Unavailable</h3>
                <p style={{ marginBottom: '2rem' }}>This tax record doesn't seem to contain regime comparison data.</p>
                <Link to="/dashboard" className="btn btn-outline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Tax Regime Comparison ({record.year})</h2>
                <Link to={`/report/${record.year}`} className="btn btn-outline">View Report</Link>
            </div>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <RegimeComparison 
                    comparisonData={{
                        oldRegime: record.regimeComparison.oldRegime,
                        newRegime: record.regimeComparison.newRegime,
                        recommendation: { 
                            regime: record.recommendedRegime, 
                            savings: record.regimeSavings,
                            reasons: record.recommendation?.reasons || [] 
                        },
                        suggestions: record.suggestions,
                        deductions: record.deductions
                    }} 
                />
            </div>
        </div>
    );
};

export default Compare;
