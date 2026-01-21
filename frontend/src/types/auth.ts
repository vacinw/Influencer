export interface User {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    authorities?: Array<{ authority: string }>;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
