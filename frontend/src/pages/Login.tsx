import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, Chrome, Apple, Facebook } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.status === 200) {
                const loginData = response.data;
                if (loginData.token) {
                    localStorage.setItem('token', loginData.token);
                }

                try {
                    const userResp = await api.get('/auth/me');
                    if (userResp.status === 200) {
                        const userData = userResp.data;
                        login(userData);
                        
                        // Handle role being either a string or an object {id, name}
                        const roleName = typeof userData.role === 'string' ? userData.role : userData.role?.name;

                        if (roleName === 'CREATOR') {
                            navigate('/creator/dashboard');
                        } else if (roleName === 'RECEIVER' || roleName === 'INFLUENCER') {
                             navigate('/receiver/dashboard');
                        } else if (roleName === 'ADMIN') {
                            navigate('/admin/dashboard');
                        } else {
                            navigate('/role-selection');
                        }
                    } else {
                        navigate('/'); 
                    }
                } catch (e) {
                    console.error("Failed to fetch user details", e);
                    // Fallback to minimal login data if /auth/me fails (e.g. backend error)
                    // We must still call login() to update the context!
                    if (loginData) {
                        // Construct a minimal user object from what we have
                        const minimalUser = {
                            id: 0, // Fallback ID
                            name: loginData.username || email, // approximate
                            email: email,
                            role: typeof loginData.role === 'string' ? { id: 0, name: loginData.role } : loginData.role,
                            token: loginData.token
                        };
                        login(minimalUser);

                        if (loginData.role) {
                             const roleName = loginData.role;
                             if (roleName === 'CREATOR') navigate('/creator/dashboard');
                             else if (roleName === 'RECEIVER') navigate('/receiver/dashboard');
                             else if (roleName === 'ADMIN') navigate('/admin/dashboard');
                             else navigate('/');
                        } else {
                            navigate('/');
                        }
                    } else {
                        navigate('/');
                    }
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-8">
                        {/* Logo Placeholder */}
                        <div className="w-8 h-8 bg-black rounded-lg transform rotate-45"></div>
                        <span className="text-xl font-bold text-gray-900">InfluConnect</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Welcome Back, Please enter your details</p>
                </div>

                {/* Toggle */}
                <div className="bg-gray-100 p-1 rounded-lg flex mb-8 w-full max-w-md">
                    <button className="w-1/2 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-900 transition-all">
                        Sign In
                    </button>
                    <Link to="/register" className="w-1/2 py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-all">
                        Signup
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-md w-full">
                    <div>
                        <div className="relative">
                            <label className="sr-only">Email Address</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <label className="sr-only">Password</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <span className="ml-2 text-gray-600">Remember me</span>
                        </label>
                        <a href="#" className="font-medium text-gray-600 hover:text-gray-900">Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Continue
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or Continue With</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <a href="http://localhost:8080/oauth2/authorization/google" className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                            <Chrome className="w-6 h-6 text-gray-600" /> {/* Using Chrome icon as generic Google placeholder or use real SVG if desired */}
                        </a>
                        <button type="button" className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                            <Apple className="w-6 h-6 text-gray-900" />
                        </button>
                        <button type="button" className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                            <Facebook className="w-6 h-6 text-blue-600" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 to-blue-200 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10 p-12">
                    <img
                        src="/auth-illustration.png"
                        alt="Security Illustration"
                        className="w-full max-w-lg object-contain drop-shadow-2xl animate-float"
                    />
                </div>
                {/* Decorative circles */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>

            {/* Add custom keyframe for float animation if not present in tailwind config, 
                 or users can see it static. I will add a style tag for simplicity. */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Login;
