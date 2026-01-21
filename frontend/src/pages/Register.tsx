import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, User, Briefcase, Chrome, Apple, Facebook, ChevronDown } from 'lucide-react';

const Register = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleName: 'CREATOR' // Default role
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: {
                    name: formData.roleName
                }
            };
            await api.post('/register', payload);
            navigate('/login');
        } catch (err: any) {
            setError(typeof err.response?.data === 'string' ? err.response.data : 'Registration failed.');
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-black rounded-lg transform rotate-45"></div>
                        <span className="text-xl font-bold text-gray-900">InfluConnect</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500">Sign up to verify your account today</p>
                </div>

                {/* Toggle */}
                <div className="bg-gray-100 p-1 rounded-lg flex mb-8 w-full max-w-md">
                    <Link to="/login" className="w-1/2 py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-all">
                        Sign In
                    </Link>
                    <button className="w-1/2 py-2 bg-white rounded-md shadow-sm text-sm font-medium text-gray-900 transition-all">
                        Signup
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
                    <div>
                        <div className="relative">
                            <label className="sr-only">Full Name</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="name"
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

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
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative">
                            <label className="sr-only">I am a...</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="relative w-full pl-10 pr-10 py-3 text-left border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <span className={!formData.roleName ? 'text-gray-500' : ''}>
                                    {formData.roleName === 'CREATOR' ? 'I want to hire (Creator)' :
                                        formData.roleName === 'RECEIVER' ? 'I want to work (KOL/Receiver)' :
                                            'Select your role'}
                                </span>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, roleName: 'CREATOR' });
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${formData.roleName === 'CREATOR' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                    >
                                        I want to hire (Creator)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, roleName: 'RECEIVER' });
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${formData.roleName === 'RECEIVER' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                    >
                                        I want to work (KOL/Receiver)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Create Account
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or Register With</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <a href="http://localhost:8080/oauth2/authorization/google" className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                            <Chrome className="w-6 h-6 text-gray-600" />
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
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-blue-300 to-blue-100 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10 p-12">
                    <img
                        src="/auth-illustration.png"
                        alt="Security Illustration"
                        className="w-full max-w-lg object-contain drop-shadow-2xl animate-float"
                    />
                </div>
                {/* Decorative circles */}
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
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

export default Register;
