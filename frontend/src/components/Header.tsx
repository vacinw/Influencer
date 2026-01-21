import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, User, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-100 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Brand */}
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-lg transform rotate-45"></div>
                            <span className="text-xl font-bold text-gray-900">InfluConnect</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                            <Link to="/" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                Home
                            </Link>
                            <Link to="/explore" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                Explore
                            </Link>

                            {user?.role?.name === 'CREATOR' && (
                                <Link to="/creator/dashboard" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                            )}
                            {user?.role?.name === 'RECEIVER' && (
                                <Link to="/receiver/dashboard" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                            )}
                            {user?.role?.name === 'ADMIN' && (
                                <Link to="/admin/dashboard" className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Admin</Link>
                            )}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {isAuthenticated ? (
                            <div className="ml-3 relative">
                                <div>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                            <User size={18} />
                                        </div>
                                        <span className="ml-2 text-gray-700 font-medium">{user?.name}</span>
                                        <ChevronDown size={16} className="ml-1 text-gray-400" />
                                    </button>
                                </div>
                                {
                                    isProfileOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
                                                Signed in as <br /> <strong className="text-gray-900">{user?.email}</strong>
                                            </div>
                                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</Link>
                                            <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Sign In</Link>
                                <Link to="/register" className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-white border-t border-gray-100">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Home</Link>
                        <Link to="/explore" className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">Explore</Link>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {isAuthenticated ? (
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        <User size={20} />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                                </div>
                                <button onClick={handleLogout} className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 space-y-1 px-2">
                                <Link to="/login" className="block text-center w-full px-4 py-2 text-base font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md">
                                    Sign In
                                </Link>
                                <Link to="/register" className="block text-center w-full px-4 py-2 text-base font-medium text-white bg-black hover:bg-gray-800 rounded-md mt-2">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
