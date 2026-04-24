import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

    axios.defaults.baseURL = 'http://localhost:5000/api';

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data.data);
        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            setToken('');
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, role) => {
        const res = await axios.post('/auth/register', { name, email, password, role });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
