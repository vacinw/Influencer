export interface User {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    authorities?: Array<{ authority: string }>;
    avatarUrl?: string;
    socialLinks?: string[];
    bio?: string;
    phone?: string;
    isVerified?: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
