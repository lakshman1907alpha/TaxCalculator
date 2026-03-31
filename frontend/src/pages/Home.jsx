import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={styles.container} className="animate-fade-in">
            <div style={styles.hero} className="glass-card">
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fff' }}>
                    Simplify Your <span style={{ color: 'var(--accent-color)' }}>Taxes</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Calculate your tax liability, track your income, and get smart AI-driven deduction suggestions to maximize your savings.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Get Started
                    </Link>
                    <Link to="/login" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Sign In
                    </Link>
                </div>
            </div>

            <div style={styles.features}>
                <div className="glass-card" style={styles.featureCard}>
                    <h3 style={{ color: 'var(--accent-hover)' }}>Smart Calculation</h3>
                    <p>Accurate tax calculations based on real-time progressive bracket models.</p>
                </div>
                <div className="glass-card" style={styles.featureCard}>
                    <h3 style={{ color: 'var(--accent-hover)' }}>AI Suggestions</h3>
                    <p>Discover unused deductions and potential savings dynamically as you input data.</p>
                </div>
                <div className="glass-card" style={styles.featureCard}>
                    <h3 style={{ color: 'var(--accent-hover)' }}>Detailed Reports</h3>
                    <p>View comprehensive breakdowns of your tax calculation without hiring expensive accountants.</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 0',
    },
    hero: {
        textAlign: 'center',
        maxWidth: '800px',
        padding: '4rem 2rem',
        marginBottom: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    features: {
        display: 'flex',
        gap: '2rem',
        width: '100%',
        maxWidth: '1000px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    featureCard: {
        flex: '1 1 300px',
        textAlign: 'left',
        padding: '2rem'
    }
};

export default Home;
