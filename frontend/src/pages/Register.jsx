import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Error creating account');
        }
    };

    return (
        <div style={styles.container} className="animate-fade-in">
            <div className="glass-card" style={styles.card}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="name"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            type="email" 
                            className="form-control"
                            name="email"
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
                            name="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            minLength={6}
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Register
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login">Sign In</Link>
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

export default Register;
