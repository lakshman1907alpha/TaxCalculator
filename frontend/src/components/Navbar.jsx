import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { token, logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={styles.nav} className="glass-card">
            <div className="container" style={styles.container}>
                <Link to="/" style={styles.logo}>
                    <span style={{ color: 'var(--accent-color)' }}>Tax</span>Assistant
                </Link>
                <div style={styles.links}>
                    {token ? (
                        <>
                            <span style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>
                                Welcome, {user ? user.name : 'User'}
                            </span>
                            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                            <Link to="/calculate" style={styles.link}>Calculate</Link>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', display: 'inline-flex' }}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        position: 'fixed',
        top: 0,
        width: '100%',
        padding: '1rem 0',
        zIndex: 100,
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#fff',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
    },
    link: {
        color: 'var(--text-main)',
        fontWeight: '500',
    }
};

export default Navbar;
