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

    const login = (user: User) => {
        setState({
            user,
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
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me'); // Using the new endpoint
            if (response.status === 200) {
                setState({
                    user: response.data,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (error) {
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
