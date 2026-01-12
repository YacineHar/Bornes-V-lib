import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import VelibMap from './components/Map';
import './App.css';

function App() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const handleLoginSuccess = (newToken) => {
        setToken(newToken);
    };

    if (loading) {
        return <div className="loading-screen">Chargement...</div>;
    }

    if (!token) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return <VelibMap />;
}

export default App;
