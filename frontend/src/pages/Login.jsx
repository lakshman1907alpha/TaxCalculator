import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <div className="glass-card" style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Login
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
    },
    error: {
        backgroundColor: 'rgba(218, 54, 51, 0.2)',
        color: 'var(--danger-color)',
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        textAlign: 'center',
    }
};

export default Login;
