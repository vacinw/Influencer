import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
    login: (user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const login = (data: any) => {
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        setState({
            user: data, // or decode token if user data is minimal
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('token');
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    const checkAuth = async () => {
        try {
            // Priority 1: Check if we have a token in localStorage
            let token = localStorage.getItem('token');

            // Priority 2: Try to exchange cookie for token (if fresh login from OAuth)
            if (!token) {
                try {
                    const tokenResp = await api.get('/auth/token');
                    if (tokenResp.status === 200 && tokenResp.data.token) {
                        token = tokenResp.data.token;
                        localStorage.setItem('token', token!);
                    }
                } catch (e) {
                    // No cookie or invalid
                }
            }

            if (token) {
                const response = await api.get('/auth/me');
                if (response.status === 200) {
                    setState({
                        user: response.data,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    throw new Error("Invalid token");
                }
            } else {
                 setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (error) {
            localStorage.removeItem('token');
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
