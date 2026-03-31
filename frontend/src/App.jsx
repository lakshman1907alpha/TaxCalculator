import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calculate from './pages/Calculate';
import Report from './pages/Report';
import './index.css';

const PrivateRoute = ({ children }) => {
    const { token, loading } = React.useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <div className="container" style={{ marginTop: '80px', paddingBottom: '40px' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/calculate" 
                            element={
                                <PrivateRoute>
                                    <Calculate />
                                </PrivateRoute>
                            } 
                        />
                        <Route 
                            path="/report/:year" 
                            element={
                                <PrivateRoute>
                                    <Report />
                                </PrivateRoute>
                            } 
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
